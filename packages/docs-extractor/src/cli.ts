import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { RunOptions } from './types';

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
        .option('includeExternal', {
            alias: 'e',
            type: 'boolean',
            default: false,
            description: 'Include props defined outside of the project',
        });
}
