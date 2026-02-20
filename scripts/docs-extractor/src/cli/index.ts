import path from 'node:path';

import { getComponentConfig, loadConfig } from '~/config';
import type { ExtractorConfig } from '~/config';
import { loadSprinklesMeta } from '~/core/defaults';
import { addSourceFiles, createProject } from '~/core/discovery';
import { extractProps } from '~/core/props-extractor';
import { getTargetLanguages } from '~/i18n/path-resolver';
import { formatFileName } from '~/output/formatter';
import { ensureDirectory, formatWithPrettier, writeMultipleFiles } from '~/output/writer';

import { cli } from './cli-definition.js';
import { buildComponentExtractOptions } from './options-builder.js';
import { resolveOptions } from './options.js';
import type { RawCliOptions } from './types.js';

function logProgress(message: string, hasFileOutput: boolean) {
    if (hasFileOutput) {
        console.error(message);
    }
}

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
        verbose: cli.flags.verbose,
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
            { ...resolved.extractOptions, verbose: resolved.verbose },
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
