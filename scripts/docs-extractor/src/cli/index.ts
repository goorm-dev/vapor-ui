import path from 'node:path';

import { config, getComponentExtractOptions } from '~/config';
import { extractProps } from '~/core/parser/orchestrator';
import { addSourceFiles, createProject } from '~/core/project/factory';
import { formatFileName } from '~/core/serializer/filename';

import { cli } from './definition';
import { CliError, resolveOptions } from './options';
import { ensureDirectory, formatWithPrettier, writeMultipleFiles } from './writer';

function logProgress(message: string) {
    console.error(message);
}

async function run() {
    const resolved = await resolveOptions({
        component: cli.flags.component,
        all: cli.flags.all,
        verbose: cli.flags.verbose,
    });

    logProgress('Parsing components...');

    const project = createProject(resolved.tsconfigPath);
    const sourceFiles = addSourceFiles(project, resolved.targetFiles);

    const total = sourceFiles.length;
    const results = sourceFiles.map((file, index) => {
        const filePath = file.getFilePath();
        const componentName = path.basename(filePath, '.tsx');
        logProgress(`Processing ${componentName} (${index + 1}/${total})`);

        const extractOptions = getComponentExtractOptions(
            { ...resolved.extractOptions, verbose: resolved.verbose },
            filePath,
        );

        return extractProps(file, extractOptions);
    });

    const allProps = results.flatMap((r) => r.props);
    logProgress(`Done! Extracted ${allProps.length} components.`);

    for (const lang of config.languages) {
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
