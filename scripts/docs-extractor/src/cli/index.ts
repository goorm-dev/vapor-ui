import meow from 'meow';
import path from 'node:path';
import { Project } from 'ts-morph';

import { config, getComponentExtractOptions } from '~/config';
import { extractProps } from '~/core/parser/orchestrator';
import { formatFileName } from '~/core/serializer/filename';

import { CliError, resolveOptions } from './options';
import { ensureDirectory, formatWithPrettier, writeMultipleFiles } from './writer';

const cli = meow(
    `
  Usage
    $ ts-api-extractor

  Options
    --component, -n   Component name to process (default: all components)
    --all, -a         Include all props (node_modules + sprinkles + html)
    --verbose, -v     Enable verbose output

  Examples
    $ ts-api-extractor
    $ ts-api-extractor --component Tabs
    $ ts-api-extractor -n Button -a
`,
    {
        importMeta: import.meta,
        flags: {
            component: {
                type: 'string',
                shortFlag: 'n',
            },
            all: {
                type: 'boolean',
                shortFlag: 'a',
                default: false,
            },
            verbose: {
                type: 'boolean',
                shortFlag: 'v',
                default: false,
            },
        },
    },
);

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

    const project = new Project({ tsConfigFilePath: resolved.tsconfigPath });
    const sourceFiles = project.addSourceFilesAtPaths(resolved.targetFiles);

    const results = sourceFiles.map((file) => {
        const filePath = file.getFilePath();
        const componentName = path.basename(filePath, '.tsx');
        logProgress(`Processing ${componentName}`);

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

        formatWithPrettier(writtenFiles);
    }
}

run().catch((error) => {
    const prefix = error instanceof CliError ? 'Error' : 'Unexpected error';
    const message = error instanceof Error ? error.message : String(error);
    console.error(`${prefix}: ${message}`);
    process.exit(1);
});
