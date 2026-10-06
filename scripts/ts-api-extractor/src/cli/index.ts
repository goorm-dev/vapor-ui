import { extract } from '#app/extract';
import { createConsoleReporter } from '#cli/reporter';
import { ExtractorError } from '#domain/errors';
import { resolveTargetFiles } from '#infrastructure/fs/component-scanner';
import { formatWithPrettier } from '#infrastructure/fs/file-writer';
import meow from 'meow';
import path from 'node:path';

async function runCli(): Promise<void> {
    const cli = meow(
        `
  Usage
    $ ts-api-extractor --input <dir> --tsconfig <file> --out <dir>

  Options
    --input           Directory to scan for component .tsx files
    --tsconfig        tsconfig.json used to resolve types
    --out             Directory the JSON files are written to
    --component, -n   Extract only this component file (default: all)
    --verbose         Print debug output

  Paths are resolved against the current working directory.

  Example
    $ ts-api-extractor --input ../../packages/core --tsconfig ../../packages/core/tsconfig.json --out ./public/components/generated
`,
        {
            importMeta: import.meta,
            flags: {
                input: { type: 'string', isRequired: true },
                tsconfig: { type: 'string', isRequired: true },
                out: { type: 'string', isRequired: true },
                component: { type: 'string', shortFlag: 'n' },
                verbose: { type: 'boolean', default: false },
            },
        },
    );

    const { input, tsconfig, out, component, verbose } = cli.flags;
    const reporter = createConsoleReporter(verbose);

    const { writtenFiles } = extract({
        tsconfigPath: path.resolve(tsconfig),
        targetFiles: await resolveTargetFiles(path.resolve(input), component),
        outputDir: path.resolve(out),
        reporter,
        // Only a full run knows which files are stale.
        removeStale: !component,
    });

    // Formatting is a CLI convenience, not part of extraction: it shells out to
    // prettier, so keeping it here leaves extract() free of child_process.
    formatWithPrettier(writtenFiles, reporter);
}

function handleCliError(error: unknown): never {
    const prefix = error instanceof ExtractorError ? 'Error' : 'Unexpected error';
    const message = error instanceof Error ? error.message : String(error);
    console.error(`${prefix}: ${message}`);
    process.exit(1);
}

runCli().catch(handleCliError);
