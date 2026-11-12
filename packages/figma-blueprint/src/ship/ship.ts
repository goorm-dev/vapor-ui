import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import type { StoredEntry } from '~/entries/entries-file';
import { PACKAGES, readEntries } from '~/entries/entries-file';

import type { Tables } from './tables';
import { TABLES_OF } from './tables';
import { writeTemplates } from './templates';

// What `figma-blueprint ship` writes to <package>/figma-blueprint/tables.json: the package's entries and its share of
// the tables, those built from its own source (core: internalIcons and defaults, composites: presets and internalParts).
// The templates and their helpers sit next to it under templates/, at their path in the package.
export type Shipped = { entries: Record<string, Omit<StoredEntry, 'url'>> } & Partial<Tables>;

export const templatesOf = (entries: Shipped['entries']) =>
    Object.values(entries).map((e) => e.template);

// `figma-blueprint ship`, run in packages/core, composites or icons. Rewrites outDir from scratch, so a rerun on the
// same source writes the same bytes.
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
