import { ExtractorError } from '#errors';
import { extract } from '#extract';
import type { Reporter } from '#reporter';
import { formatWithPrettier, writeDocs } from '#write';
import meow from 'meow';
import path from 'node:path';

/** The only place in the package that touches the console. Everything goes to stderr. */
function createConsoleReporter(verbose: boolean): Reporter {
    return {
        info: (message) => console.error(message),
        warn: (message) => console.warn(`[ts-api-extractor] ${message}`),
        debug: (message) => {
            if (verbose) console.error(`[verbose] ${message}`);
        },
    };
}

function runCli(): void {
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

    const docs = extract({
        inputPath: path.resolve(input),
        tsconfigPath: path.resolve(tsconfig),
        component,
        reporter,
    });

    // Only a full run knows which files are stale.
    const { written, removed } = writeDocs(out, docs, { removeStale: !component });
    if (removed.length > 0) reporter.info(`Removed ${removed.length} stale files.`);

    try {
        formatWithPrettier(written);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        reporter.warn(`Prettier formatting skipped: ${message}`);
    }
}

try {
    runCli();
} catch (error) {
    const prefix = error instanceof ExtractorError ? 'Error' : 'Unexpected error';
    const message = error instanceof Error ? error.message : String(error);
    console.error(`${prefix}: ${message}`);
    process.exit(1);
}
