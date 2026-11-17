// The Catalog: the templates and tables a blueprint runs on, keyed by Figma component (set) key.
// `figma-blueprint ship` writes one package's share as that package's figma-blueprint/ folder; fromInstalled reads the
// folders back from a consumer's node_modules; fromRepo builds the same from the repo's source. This file is the only
// one that knows the folder's layout, which is published inside @vapor-ui/core and icons.
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';

import { importTemplate, writeTemplates } from '~/code-connect/compile';
import type { Batch } from '~/code-connect/files';
import type { TemplateFn } from '~/code-connect/stand-in';
import { readEntries } from '~/entries';
import type { StoredEntry } from '~/entries';
import { PACKAGES } from '~/packages';
import type { Pkg } from '~/packages';

import { TABLES_OF, extractTables } from './tables';
import type { Tables } from './tables';

export type { Tables };

// One Code Connect template (one row of it for a batch template), keyed in `entries` by Figma component (set) key.
// template is relative to the package directory.
export interface Entry {
    name: string;
    pkg: Pkg;
    template: string;
    batch: Batch | null;
}

export interface Catalog {
    entries: Record<string, Entry>;
    tables: Tables;
    runTemplate(entry: Entry): TemplateFn;
}

// <package>/figma-blueprint/tables.json: the package's entries and its share of the tables, those built from its own
// source (core: internalIcons and defaults, composites: presets and internalParts). The templates and their helpers
// sit next to it under templates/, at their path in the package.
const SHIPPED = 'figma-blueprint';
const TABLES_JSON = 'tables.json';
const TEMPLATES = 'templates';
type Shipped = { entries: Record<string, Omit<StoredEntry, 'url'>> } & Partial<Tables>;

const templatesOf = (entries: Shipped['entries']) => Object.values(entries).map((e) => e.template);

// `figma-blueprint ship`, run in packages/core, composites or icons. Rewrites outDir from scratch, so a rerun on the
// same source writes the same bytes.
export function buildPackage(pkgDir: string, outDir = join(pkgDir, SHIPPED)) {
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
    writeTemplates(pkgDir, templatesOf(entries), join(outDir, TEMPLATES), true);
    const shipped: Shipped = { entries, ...TABLES_OF[pkg](pkgDir) };
    writeFileSync(join(outDir, TABLES_JSON), `${JSON.stringify(shipped)}\n`);
}

// A package's entries, with their templates written (wrapped) under dir/templates, as JS or as TypeScript.
interface Templates {
    pkg: Pkg;
    entries: Shipped['entries'];
    dir: string;
    js: boolean;
}

async function load(packages: Templates[], tables: Tables): Promise<Catalog> {
    const entries: Record<string, Entry> = {};
    const runs = new Map<string, TemplateFn>();
    for (const { pkg, entries: own, dir, js } of packages)
        for (const [key, { name, template, batch }] of Object.entries(own)) {
            entries[key] = { name, pkg, template, batch };
            const id = `${pkg}/${template}`;
            if (runs.has(id)) continue;
            runs.set(id, await importTemplate(join(dir, TEMPLATES), template, js));
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
// same writeTemplates as `figma-blueprint ship`, left as TypeScript.
export async function fromRepo(root: string): Promise<Catalog> {
    const tmp = mkdtempSync(join(tmpdir(), 'figma-blueprint-'));
    try {
        const packages = PACKAGES.map((pkg): Templates => {
            const pkgDir = join(root, 'packages', pkg);
            const entries = readEntries(pkgDir);
            const dir = join(tmp, pkg);
            writeTemplates(pkgDir, templatesOf(entries), join(dir, TEMPLATES), false);
            return { pkg, entries, dir, js: false };
        });
        return await load(packages, extractTables(root));
    } finally {
        rmSync(tmp, { recursive: true, force: true });
    }
}

// What `figma-blueprint ship` shipped in the @vapor-ui packages that cwd resolves. A package that is not installed is
// left out, with a line on stderr, and its instances in a design are unscorable.
export async function fromInstalled(cwd: string): Promise<Catalog> {
    const require = createRequire(join(resolve(cwd), 'package.json'));
    const tables: Tables = { internalIcons: {}, internalParts: {}, presets: {}, defaults: {} };
    const packages: Templates[] = [];
    for (const pkg of PACKAGES) {
        let file;
        try {
            file = require.resolve(`@vapor-ui/${pkg}/${SHIPPED}/${TABLES_JSON}`);
        } catch (e) {
            const why =
                (e as NodeJS.ErrnoException).code === 'ERR_PACKAGE_PATH_NOT_EXPORTED'
                    ? 'ships no figma-blueprint tables'
                    : 'is not installed';
            console.error(`@vapor-ui/${pkg} ${why}, its instances are unscorable`);
            continue;
        }
        const { entries, ...share } = JSON.parse(readFileSync(file, 'utf8')) as Shipped;
        Object.assign(tables, share);
        packages.push({ pkg, entries, dir: dirname(file), js: true });
    }
    return load(packages, tables);
}
