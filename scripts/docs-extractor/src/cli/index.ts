import meow from 'meow';
import path from 'node:path';

import { getComponentConfig, loadConfig } from '~/config';
import type { ExtractorConfig } from '~/config';
import { addSourceFiles, createProject } from '~/core/project';
import { type ExtractOptions, extractProps } from '~/core/props-extractor';
import { type SprinklesMeta, loadSprinklesMeta } from '~/core/sprinkles-analyzer';
import { getTargetLanguages } from '~/i18n/path-resolver';
import { formatFileName } from '~/output/formatter';
import { ensureDirectory, formatWithPrettier, writeMultipleFiles } from '~/output/writer';

import type { RawCliOptions } from './options.js';
import { resolveOptions } from './options.js';

/**
 * Build component-specific extract options based on config
 */
function buildComponentExtractOptions(
    baseOptions: ExtractOptions,
    componentConfig: ExtractorConfig['components'][string] | undefined,
    sprinklesMeta: SprinklesMeta | null,
): ExtractOptions {
    const options: ExtractOptions = {
        ...baseOptions,
        sprinklesMeta: sprinklesMeta ?? undefined,
    };

    if (!componentConfig) {
        return options;
    }

    // sprinklesAll: include all sprinkles props
    if (componentConfig.sprinklesAll) {
        options.filterSprinkles = false;
    }

    // sprinkles: include specific sprinkles props
    if (componentConfig.sprinkles?.length) {
        options.include = [...(options.include ?? []), ...componentConfig.sprinkles];
    }

    // component-specific include
    if (componentConfig.include?.length) {
        options.include = [...(options.include ?? []), ...componentConfig.include];
    }

    return options;
}

function logProgress(message: string, hasFileOutput: boolean) {
    if (hasFileOutput) {
        console.error(message);
    }
}

const cli = meow(
    `
  Usage
    $ ts-api-extractor [path]

  Options
    --tsconfig, -c         Path to tsconfig.json (default: auto-detect)
    --exclude, -e          Additional exclude patterns (added to defaults)
    --no-exclude-defaults  Disable default exclude patterns (.stories.tsx, .css.ts)
    --component, -n        Component name to process (e.g., Button, TextInput)
    --output-dir, -d       Output directory for per-component files
    --all, -a              Include all props (node_modules + sprinkles + html)
    --include              Include specific props (can be used multiple times)
    --include-html         Include specific HTML attributes (e.g., --include-html className style)
    --config               Config file path (default: docs-extractor.config.ts)
    --no-config            Ignore config file
    --lang, -l             Output language (ko, en, all)

  Examples
    $ ts-api-extractor ./packages/core
    $ ts-api-extractor ./packages/core --component Tabs
    $ ts-api-extractor ./packages/core --component Tabs --output-dir ./output
    $ ts-api-extractor ./packages/core --lang en
    $ ts-api-extractor ./packages/core --lang all
    $ ts-api-extractor  # Interactive mode: prompts for path and components
`,
    {
        importMeta: import.meta,
        flags: {
            tsconfig: {
                type: 'string',
                shortFlag: 'c',
            },
            exclude: {
                type: 'string',
                shortFlag: 'e',
                isMultiple: true,
            },
            excludeDefaults: {
                type: 'boolean',
                default: true,
            },
            component: {
                type: 'string',
                shortFlag: 'n',
            },
            outputDir: {
                type: 'string',
                shortFlag: 'd',
            },
            all: {
                type: 'boolean',
                shortFlag: 'a',
                default: false,
            },
            include: {
                type: 'string',
                isMultiple: true,
            },
            includeHtml: {
                type: 'string',
                isMultiple: true,
            },
            config: {
                type: 'string',
            },
            noConfig: {
                type: 'boolean',
                default: false,
            },
            lang: {
                type: 'string',
                shortFlag: 'l',
            },
        },
    },
);

const [inputPath] = cli.input;

export async function run() {
    // Load configuration
    let config: ExtractorConfig;
    let configSource: 'file' | 'default';

    try {
        const result = await loadConfig({
            configPath: cli.flags.config,
            noConfig: cli.flags.noConfig,
        });
        config = result.config;
        configSource = result.source;
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`Failed to load configuration: ${message}`);
        process.exit(1);
    }

    if (configSource === 'file') {
        console.error('Using config file');
    }

    // Use config outputDir if CLI option not provided
    const outputDir = cli.flags.outputDir ?? config.global.outputDir;

    const rawOptions: RawCliOptions = {
        path: inputPath,
        tsconfig: cli.flags.tsconfig,
        exclude: cli.flags.exclude ?? [],
        excludeDefaults: cli.flags.excludeDefaults,
        component: cli.flags.component,
        outputDir,
        all: cli.flags.all,
        include: cli.flags.include,
        includeHtml: cli.flags.includeHtml,
        config: cli.flags.config,
        noConfig: cli.flags.noConfig,
        lang: cli.flags.lang,
    };

    const resolved = await resolveOptions(rawOptions, {
        filterSprinkles: config.global.filterSprinkles,
    });

    const hasFileOutput = resolved.outputMode.type !== 'stdout';

    logProgress('Parsing components...', hasFileOutput);

    // Load sprinkles metadata if available
    const sprinklesMeta = config.sprinkles?.metaPath
        ? loadSprinklesMeta(config.sprinkles.metaPath)
        : null;

    const project = createProject(resolved.tsconfigPath);
    const sourceFiles = addSourceFiles(project, resolved.targetFiles);

    const total = sourceFiles.length;
    const results = sourceFiles.map((file, index) => {
        const filePath = file.getFilePath();
        const componentName = path.basename(filePath, '.tsx');
        logProgress(`Processing ${componentName} (${index + 1}/${total})`, hasFileOutput);

        // Get component-specific config
        const componentConfig = getComponentConfig(config, filePath);
        const extractOptions = buildComponentExtractOptions(
            resolved.extractOptions,
            componentConfig,
            sprinklesMeta,
        );

        return extractProps(file, extractOptions);
    });

    const allProps = results.flatMap((r) => r.props);
    logProgress(`Done! Extracted ${allProps.length} components.`, hasFileOutput);

    if (resolved.outputMode.type === 'directory') {
        // Determine output directory based on config and CLI options
        const baseOutputDir = resolved.outputMode.path;

        // Get target languages
        const targetLanguages = getTargetLanguages(cli.flags.lang, {
            outputDir: baseOutputDir,
            languages: config.global.languages,
            defaultLanguage: config.global.defaultLanguage,
        });

        // Write files for each language
        for (const lang of targetLanguages) {
            const langOutputDir = path.join(baseOutputDir, lang);
            ensureDirectory(langOutputDir);

            const writtenFiles = writeMultipleFiles(allProps, langOutputDir, (prop) =>
                formatFileName(prop.name),
            );

            for (const file of writtenFiles) {
                console.log(`Written to ${file}`);
            }

            formatWithPrettier(writtenFiles);
        }
    } else {
        const output = allProps.length === 1 ? allProps[0] : allProps;
        console.log(JSON.stringify(output, null, 2));
    }
}
