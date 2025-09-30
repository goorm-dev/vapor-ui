import { globby } from 'globby';
import * as path from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { extractComponentTypesFromFile } from '../type-extractor';
import { RunOptions } from '../types/types';
import { createComponentData, ensureOutputDirectory, writeComponentDataToFile } from '../utils';

export function createCliCommand(runFunction: (options: RunOptions) => Promise<void>) {
    return yargs(hideBin(process.argv))
        .command<RunOptions>(
            '$0',
            'Extracts the API descriptions from a set of files',
            buildCommandOptions,
            runFunction,
        )
        .help()
        .strict()
        .version(false);
}

function buildCommandOptions(command: any) {
    return command
        .option('configPath', {
            alias: 'c',
            type: 'string',
            demandOption: true,
            description: 'The path to the tsconfig.json file',
        })
        .option('out', {
            alias: 'o',
            demandOption: true,
            type: 'string',
            description: 'The output directory.',
        })
        .option('files', {
            alias: 'f',
            type: 'array',
            demandOption: false,
            description:
                'The files to extract the API descriptions from. If not provided, all files in the tsconfig.json are used. You can use globs like `src/**/*.{ts,tsx}` and `!**/*.test.*`. Paths are relative to the tsconfig.json file.',
        })
        .option('externalTypePaths', {
            alias: 'x',
            type: 'array',
            default: ['@base-ui-components/react:esm/index.d.ts'],
            description: 'External type definition files to include (format: package:subpath)',
        });
}

export async function main(options: RunOptions) {
    try {
        const { configPath, out: outputPath } = options;
        const configDir = path.dirname(configPath);

        // Resolve glob patterns to actual file paths
        let resolvedFiles: string[] = [];
        if (options.files && options.files.length > 0) {
            const patterns = options.files;
            resolvedFiles = await globby(patterns, {
                cwd: configDir,
                absolute: false,
                onlyFiles: true,
                ignore: ['**/*.stories.{ts,tsx}', '**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
            });
        }

        if (resolvedFiles.length > 0) {
            for (const filePath of resolvedFiles) {
                const fullPath = path.resolve(configDir, filePath);
                const components = extractComponentTypesFromFile(
                    configPath,
                    fullPath,
                    undefined,
                    options.externalTypePaths,
                );

                console.log(`In "${filePath}" found ${components.length} components.`);

                ensureOutputDirectory(outputPath);

                for (const [_, component] of components.entries()) {
                    const componentData = createComponentData(component, fullPath);
                    await writeComponentDataToFile(componentData, outputPath);
                }
            }
        } else {
            console.log(
                'The files to analyze were not specified. Please use the -f option to specify files.',
            );
        }

        console.log('\nType extraction complete!');
    } catch (error) {
        console.error('Error occurred during type extraction:', error);
        process.exit(1);
    }
}

createCliCommand(main).parse();