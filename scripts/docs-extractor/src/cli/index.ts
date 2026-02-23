import path from 'node:path';

import { ensureDirectory, formatWithPrettier, writeMultipleFiles } from '~/cli/writer';
import { getComponentConfig, loadConfig } from '~/config';
import { extractProps } from '~/core/parser/orchestrator';
import { addSourceFiles, createProject } from '~/core/project/factory';
import { formatFileName } from '~/core/serializer/filename';

import { cli } from './definition.js';
import {
    CliError,
    type RawCliOptions,
    buildComponentExtractOptions,
    resolveOptions,
} from './options.js';

function logProgress(message: string) {
    console.error(message);
}

async function run() {
    const { config, source: configSource } = await loadConfig({
        configPath: cli.flags.config,
        noConfig: cli.flags.noConfig,
    });

    if (configSource === 'file') {
        logProgress('Using config file');
    }

    const [inputPath] = cli.input;

    const rawOptions: RawCliOptions = {
        path: inputPath,
        component: cli.flags.component,
        all: cli.flags.all,
        config: cli.flags.config,
        noConfig: cli.flags.noConfig,
        verbose: cli.flags.verbose,
    };

    const resolved = await resolveOptions(rawOptions, config);

    logProgress('Parsing components...');

    const project = createProject(resolved.tsconfigPath);
    const sourceFiles = addSourceFiles(project, resolved.targetFiles);

    const total = sourceFiles.length;
    const results = sourceFiles.map((file, index) => {
        const filePath = file.getFilePath();
        const componentName = path.basename(filePath, '.tsx');
        logProgress(`Processing ${componentName} (${index + 1}/${total})`);

        const componentConfig = getComponentConfig(config, filePath);
        const extractOptions = buildComponentExtractOptions(
            { ...resolved.extractOptions, verbose: resolved.verbose },
            componentConfig,
        );

        return extractProps(file, extractOptions);
    });

    const allProps = results.flatMap((r) => r.props);
    logProgress(`Done! Extracted ${allProps.length} components.`);

    for (const lang of config.global.languages) {
        const langOutputDir = path.join(resolved.outputDir, lang);
        ensureDirectory(langOutputDir);

        const writtenFiles = writeMultipleFiles(allProps, langOutputDir, (prop) =>
            formatFileName(prop.name),
        );

        for (const file of writtenFiles) {
            console.log(`Written to ${file}`);
        }

        formatWithPrettier(writtenFiles);
    }
}

run().catch((error) => {
    const prefix = error instanceof CliError ? 'Error' : 'Unexpected error';
    const message = error instanceof Error ? error.message : String(error);
    console.error(`${prefix}: ${message}`);
    process.exit(1);
});
