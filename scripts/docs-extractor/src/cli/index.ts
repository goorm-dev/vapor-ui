import meow from 'meow';
import path from 'node:path';

import { loadConfig } from '~/config';
import { addSourceFiles, createProject } from '~/core/project';
import { extractProps } from '~/core/props-extractor';
import { getTargetLanguages } from '~/i18n/path-resolver';
import { formatFileName } from '~/output/formatter';
import { ensureDirectory, formatWithPrettier, writeMultipleFiles } from '~/output/writer';

import type { RawCliOptions } from './options.js';
import { resolveOptions } from './options.js';

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
    const { config, source: configSource } = await loadConfig({
        configPath: cli.flags.config,
        noConfig: cli.flags.noConfig,
    });

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

    const project = createProject(resolved.tsconfigPath);
    const sourceFiles = addSourceFiles(project, resolved.targetFiles);

    const total = sourceFiles.length;
    const results = sourceFiles.map((file, index) => {
        const componentName = path.basename(file.getFilePath(), '.tsx');
        logProgress(`Processing ${componentName} (${index + 1}/${total})`, hasFileOutput);
        return extractProps(file, resolved.extractOptions);
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
