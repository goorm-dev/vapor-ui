import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import type { Batch } from '~/entries/code-connect';
import { PACKAGES, readEntries } from '~/entries/entries-file';
import type { Pkg } from '~/entries/entries-file';
import type { Shipped } from '~/ship/ship';
import { templatesOf } from '~/ship/ship';
import { extractTables } from '~/ship/tables';
import type { Tables } from '~/ship/tables';
import { writeTemplates } from '~/ship/templates';
import type { TemplateFn } from '~/ship/templates';

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

// A package's entries, with their templates written (wrapped) under dir/templates, `ext` in place of `.ts`.
interface Templates {
    pkg: Pkg;
    entries: Shipped['entries'];
    dir: string;
    ext: string;
}

async function load(packages: Templates[], tables: Tables): Promise<Catalog> {
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
// same writeTemplates as `figma-blueprint ship`, left as TypeScript.
export async function fromRepo(root: string): Promise<Catalog> {
    const tmp = mkdtempSync(join(tmpdir(), 'figma-blueprint-'));
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

// What `figma-blueprint ship` shipped in the @vapor-ui packages that cwd resolves. A package that is not installed is
// left out, with a line on stderr.
export async function fromInstalled(cwd: string): Promise<Catalog> {
    const require = createRequire(join(resolve(cwd), 'package.json'));
    const tables: Tables = { internalIcons: {}, internalParts: {}, presets: {}, defaults: {} };
    const packages: Templates[] = [];
    for (const pkg of PACKAGES) {
        let file;
        try {
            file = require.resolve(`@vapor-ui/${pkg}/figma-blueprint/tables.json`);
        } catch (e) {
            const why =
                (e as NodeJS.ErrnoException).code === 'ERR_PACKAGE_PATH_NOT_EXPORTED'
                    ? 'ships no figma-blueprint tables'
                    : 'is not installed';
            console.error(`@vapor-ui/${pkg} ${why}, its components are left out`);
            continue;
        }
        const { entries, ...share } = JSON.parse(readFileSync(file, 'utf8')) as Shipped;
        Object.assign(tables, share);
        packages.push({ pkg, entries, dir: dirname(file), ext: '.mjs' });
    }
    return load(packages, tables);
}
