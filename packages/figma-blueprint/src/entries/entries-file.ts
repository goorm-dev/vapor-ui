import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { Batch } from './code-connect';
import { connections } from './code-connect';

export const PACKAGES = ['core', 'composites', 'icons'] as const;
export type Pkg = (typeof PACKAGES)[number];

// What `figma-blueprint entries` writes to packages/<pkg>/figma-entries.json, keyed by Figma component (set) key.
// template is relative to the package directory.
export interface StoredEntry {
    name: string;
    url: string;
    template: string;
    batch: Batch | null;
}

export const readEntries = (pkgDir: string): Record<string, StoredEntry> =>
    JSON.parse(readFileSync(join(pkgDir, 'figma-entries.json'), 'utf8'));

// Code Connect URLs whose entry, as the package's source states it now (url, template, batch row), is not in its
// figma-entries.json. Rerun `figma-blueprint entries` to add them.
export function missingEntries(pkgDir: string): string[] {
    const stored = existsSync(join(pkgDir, 'figma-entries.json'))
        ? Object.values(readEntries(pkgDir))
        : [];
    const have = new Set(
        stored.map(({ url, template, batch }) => JSON.stringify({ url, template, batch })),
    );
    return connections(pkgDir)
        .filter((c) => !have.has(JSON.stringify(c)))
        .map((c) => c.url);
}
