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

const SHIPPED = 'figma-blueprint';
const TABLES_JSON = 'tables.json';
const TEMPLATES = 'templates';
type Shipped = { entries: Record<string, Omit<StoredEntry, 'url'>> } & Partial<Tables>;

const templatesOf = (entries: Shipped['entries']) => Object.values(entries).map((e) => e.template);

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

interface PackageShare {
    pkg: Pkg;
    entries: Shipped['entries'];
    dir: string;
    js: boolean;
}

async function load(packages: PackageShare[], tables: Tables): Promise<Catalog> {
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

export async function fromRepo(root: string): Promise<Catalog> {
    const tmp = mkdtempSync(join(tmpdir(), 'figma-blueprint-'));
    try {
        const packages = PACKAGES.map((pkg): PackageShare => {
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

export async function fromInstalled(cwd: string): Promise<Catalog> {
    const require = createRequire(join(resolve(cwd), 'package.json'));
    const tables: Tables = { internalIcons: {}, internalParts: {}, presets: {}, defaults: {} };
    const packages: PackageShare[] = [];
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
