import { ExtractorError } from '#errors';
import { extract } from '#extract';
import type { Reporter } from '#reporter';
import { type ComponentPageMap, formatWithPrettier, writeDocs } from '#write';
import meow from 'meow';
import fs from 'node:fs';
import path from 'node:path';

/** The only place in the package that touches the console. Everything goes to stderr. */
function createConsoleReporter(verbose: boolean): Reporter {
    return {
        info: (message) => console.error(message),
        warn: (message) => console.warn(`[docs-extractor] ${message}`),
        debug: (message) => {
            if (verbose) console.error(`[verbose] ${message}`);
        },
    };
}

function runCli(): void {
    const cli = meow(
        `
  Usage
    $ docs-extractor --input <dir> --tsconfig <file> --pages <dir>

  Options
    --input                 Directory to scan for component .tsx files
    --tsconfig              tsconfig.json used to resolve types
    --pages                 Directory holding one folder per page (<page>/index.mdx),
                            directly or in a route group like (components)/.
                            Each component's JSON is written to <page>/api/en/,
                            mirrored to <page>/api/ko/ (see README)
    --component, -n         Extract only this component file (default: all)
    --component-page-map    JSON file mapping component folder → page slug (or null to skip).
                            Overrides the built-in core map; use this for Composites.
    --only-local-jsdoc      Keep only props whose declaration lives inside --input.
                            Drops props inherited from a wrapped primitive. Use for
                            Composites so only wrapper-owned API is documented.
    --verbose               Print debug output

  Paths are resolved against the current working directory.

  Example
    $ docs-extractor --input ../../packages/core --tsconfig ../../packages/core/tsconfig.json --pages ./content/docs/components
`,
        {
            importMeta: import.meta,
            flags: {
                input: { type: 'string', isRequired: true },
                tsconfig: { type: 'string', isRequired: true },
                pages: { type: 'string', isRequired: true },
                component: { type: 'string', shortFlag: 'n' },
                componentPageMap: { type: 'string' },
                onlyLocalJsdoc: { type: 'boolean', default: false },
                verbose: { type: 'boolean', default: false },
            },
        },
    );

    const { input, tsconfig, pages, component, componentPageMap, onlyLocalJsdoc, verbose } =
        cli.flags;
    const reporter = createConsoleReporter(verbose);

    const pageMap = componentPageMap ? loadComponentPageMap(componentPageMap) : undefined;

    const { docs, sourceFiles, failures } = extract({
        inputPath: path.resolve(input),
        tsconfigPath: path.resolve(tsconfig),
        component,
        reporter,
        onlyLocalJsDoc: onlyLocalJsdoc,
    });

    // Only a full, clean run knows which files are stale: a component that failed
    // to parse would look stale and lose its committed JSON.
    const removeStale = !component && failures.length === 0;
    if (!component && failures.length > 0) {
        reporter.warn(
            `Kept stale files because ${failures.length} files or components failed to parse.`,
        );
    }

    const { written, removed } = writeDocs(
        pages,
        docs.map((doc, i) => ({ doc, sourceFile: sourceFiles[i] })),
        { removeStale, componentPageMap: pageMap },
    );
    if (removed.length > 0) reporter.info(`Removed ${removed.length} stale files.`);

    try {
        formatWithPrettier(written);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        reporter.warn(`Prettier formatting skipped: ${message}`);
    }
}

function loadComponentPageMap(filePath: string): ComponentPageMap {
    const resolved = path.resolve(filePath);
    let raw: string;
    try {
        raw = fs.readFileSync(resolved, 'utf8');
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new ExtractorError(`Cannot read --component-page-map ${resolved}: ${message}`);
    }

    let parsed: unknown;
    try {
        parsed = JSON.parse(raw);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new ExtractorError(`--component-page-map ${resolved} is not valid JSON: ${message}`);
    }

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new ExtractorError(
            `--component-page-map ${resolved} must be an object { "<folder>": "<slug>" | null }`,
        );
    }

    const map: ComponentPageMap = {};
    for (const [key, value] of Object.entries(parsed)) {
        if (value !== null && typeof value !== 'string') {
            throw new ExtractorError(
                `--component-page-map ${resolved}: value for "${key}" must be a string or null`,
            );
        }
        map[key] = value;
    }
    return map;
}

try {
    runCli();
} catch (error) {
    const prefix = error instanceof ExtractorError ? 'Error' : 'Unexpected error';
    const message = error instanceof Error ? error.message : String(error);
    console.error(`${prefix}: ${message}`);
    process.exit(1);
}
