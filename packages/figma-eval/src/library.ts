import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';

import { TABLES_OF, extractTables, writeTemplates } from './build';
import type { Batch } from './figma-mock';

export const PACKAGES = ['core', 'composites', 'icons'] as const;
export type Pkg = (typeof PACKAGES)[number];

// One Code Connect template (one row of it for a batch template), keyed in `entries` by Figma component (set) key.
// template is relative to the package directory.
export interface Entry {
    name: string;
    pkg: Pkg;
    template: string;
    batch: Batch | null;
}

export interface Tables {
    // core part → icons it draws itself (Select.Trigger's chevron)
    internalIcons: Record<string, string[]>;
    // composites part → core components it draws itself (Dialog.Root's close IconButton)
    internalParts: Record<string, string[]>;
    // composites wrapper → the core element it renders, with fixed props (Dialog.Action is a primary lg Button). A
    // list is a prop the wrapper picks from its context: AlertDialog.Action is danger or primary.
    presets: Record<string, { tag: string; props: Record<string, string | string[]> }>;
    // core part → recipe defaultVariants (Button is variant "fill")
    defaults: Record<string, Record<string, string>>;
}

export interface TemplateResult {
    id?: string;
    example?: unknown;
}

export type TemplateFn = () => TemplateResult;

export interface Library {
    entries: Record<string, Entry>;
    tables: Tables;
    runTemplate(entry: Entry): TemplateFn;
}

// What `figma-eval map` writes to packages/<pkg>/figma-entries.json, keyed by Figma component (set) key.
// template is relative to the package directory.
export interface StoredEntry {
    name: string;
    url: string;
    template: string;
    batch: Batch | null;
}

export const readEntries = (pkgDir: string): Record<string, StoredEntry> =>
    JSON.parse(readFileSync(join(pkgDir, 'figma-entries.json'), 'utf8'));

// What `figma-eval build` writes to <package>/figma-eval/tables.json: the package's entries and its share of the
// tables, those built from its own source (core: internalIcons and defaults, composites: presets and internalParts).
// The templates and their helpers sit next to it under templates/, at their path in the package.
type Shipped = { entries: Record<string, Omit<Entry, 'pkg'>> } & Partial<Tables>;

// A package's entries, with their templates written (wrapped) under dir/templates, `ext` in place of `.ts`.
interface Templates {
    pkg: Pkg;
    entries: Shipped['entries'];
    dir: string;
    ext: string;
}

const templatesOf = (entries: Shipped['entries']) => Object.values(entries).map((e) => e.template);

// `figma-eval build`, run in packages/core, composites or icons. Rewrites outDir from scratch, so a rerun on the same
// source writes the same bytes.
export function buildPackage(pkgDir: string, outDir: string) {
    const { name } = JSON.parse(readFileSync(join(pkgDir, 'package.json'), 'utf8')) as {
        name: string;
    };
    const pkg = PACKAGES.find((p) => name === `@vapor-ui/${p}`);
    if (!pkg) throw new Error(`runs in @vapor-ui/{${PACKAGES.join(',')}}, not in ${name}`);
    const entries: Shipped['entries'] = {};
    for (const [key, e] of Object.entries(readEntries(pkgDir)))
        entries[key] = { name: e.name, template: e.template, batch: e.batch };
    rmSync(outDir, { recursive: true, force: true });
    mkdirSync(outDir, { recursive: true });
    writeTemplates(pkgDir, templatesOf(entries), join(outDir, 'templates'), true);
    const shipped: Shipped = { entries, ...TABLES_OF[pkg](pkgDir) };
    writeFileSync(join(outDir, 'tables.json'), `${JSON.stringify(shipped)}\n`);
}

async function load(packages: Templates[], tables: Tables): Promise<Library> {
    const entries: Record<string, Entry> = {};
    const runs = new Map<string, TemplateFn>();
    for (const { pkg, entries: own, dir, ext } of packages)
        for (const [key, { name, template, batch }] of Object.entries(own)) {
            entries[key] = { name, pkg, template, batch };
            const id = `${pkg}/${template}`;
            if (runs.has(id)) continue;
            const file = join(dir, 'templates', template.replace(/\.ts$/, ext));
            const mod = (await import(pathToFileURL(file).href)) as { default: TemplateFn };
            runs.set(id, mod.default);
        }
    return {
        entries,
        tables,
        runTemplate(entry) {
            const run = runs.get(`${entry.pkg}/${entry.template}`);
            if (!run) throw new Error(`no template loaded for ${entry.pkg}/${entry.template}`);
            return run;
        },
    };
}

// Entries from the three packages' figma-entries.json and tables from the repo's source. Templates go through the
// same writeTemplates as `figma-eval build`, left as TypeScript.
export async function fromRepo(root: string): Promise<Library> {
    const tmp = mkdtempSync(join(tmpdir(), 'figma-eval-'));
    try {
        const packages = PACKAGES.map((pkg): Templates => {
            const pkgDir = join(root, 'packages', pkg);
            const entries = readEntries(pkgDir);
            const dir = join(tmp, pkg);
            writeTemplates(pkgDir, templatesOf(entries), join(dir, 'templates'), false);
            return { pkg, entries, dir, ext: '.mts' };
        });
        return await load(packages, extractTables(root));
    } finally {
        rmSync(tmp, { recursive: true, force: true });
    }
}

// What `figma-eval build` shipped in the @vapor-ui packages that cwd resolves. A package that is not installed is
// left out, with a line on stderr: its components are not graded.
export async function fromInstalled(cwd: string): Promise<Library> {
    const require = createRequire(join(cwd, 'package.json'));
    const tables: Tables = { internalIcons: {}, internalParts: {}, presets: {}, defaults: {} };
    const packages: Templates[] = [];
    for (const pkg of PACKAGES) {
        let file;
        try {
            file = require.resolve(`@vapor-ui/${pkg}/figma-eval/tables.json`);
        } catch (e) {
            const why =
                (e as NodeJS.ErrnoException).code === 'ERR_PACKAGE_PATH_NOT_EXPORTED'
                    ? 'ships no figma-eval tables'
                    : 'is not installed';
            console.error(`@vapor-ui/${pkg} ${why}, its components are not graded`);
            continue;
        }
        const { entries, ...share } = JSON.parse(readFileSync(file, 'utf8')) as Shipped;
        Object.assign(tables, share);
        packages.push({ pkg, entries, dir: dirname(file), ext: '.mjs' });
    }
    return load(packages, tables);
}
