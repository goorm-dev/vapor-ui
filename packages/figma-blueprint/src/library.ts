// `figma-blueprint library`, the weekly check that every component Figma publishes is linked or has a reason in
// packages/<pkg>/figma-exceptions.json, and that no entry or exception is stale. checkLibrary is the pure part.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { readEntries } from '~/entries';
import type { StoredEntry } from '~/entries';
import { fetchLibraryFile, figmaToken, parseFigmaUrl } from '~/figma';
import type { Published } from '~/figma';
import { isCoreComponent } from '~/packages';
import type { Pkg } from '~/packages';

export interface LibraryItem {
    key: string;
    name: string;
    page: string;
}

// Why a published library component has no Code Connect link on purpose, keyed by its Figma key.
export interface Exceptions {
    figma: Record<string, string>;
}

// Packages whose library file is checked, and which of its top-level items must be linked.
const TARGETS: Partial<Record<Pkg, (item: LibraryItem) => boolean>> = {
    core: (item) => isCoreComponent(item.name),
    composites: () => true,
};

// Figma pads names and pages with control characters, spaces and the ❖ marker.
const tidy = (s: string) => s.replace(/[\p{Cc}❖]/gu, '').trim();

// Component sets and standalone components; the variants inside a set are not link targets.
export function libraryItems(sets: Published[], comps: Published[]): LibraryItem[] {
    return [...sets, ...comps.filter((c) => !c.containing_frame?.containingComponentSet)].map(
        (c) => ({
            key: c.key,
            name: tidy(c.name),
            page: tidy(c.containing_frame?.pageName ?? ''),
        }),
    );
}

// Keys only: Figma names carry control characters, stray spaces and case drift.
export function checkLibrary(
    items: LibraryItem[],
    entries: Record<string, StoredEntry>,
    exceptions: Exceptions,
    isTarget: (item: LibraryItem) => boolean,
) {
    const published = new Set(items.map((i) => i.key));
    return {
        gone: Object.keys(entries).filter((k) => !published.has(k)),
        unconnected: items.filter(
            (i) => isTarget(i) && !(i.key in entries) && !(i.key in exceptions.figma),
        ),
        stale: Object.keys(exceptions.figma).filter((k) => k in entries || !published.has(k)),
    };
}

export function readExceptions(pkgDir: string): Exceptions {
    const file = join(pkgDir, 'figma-exceptions.json');
    if (!existsSync(file)) return { figma: {} };
    const { figma = {} } = JSON.parse(readFileSync(file, 'utf8')) as Partial<Exceptions>;
    for (const [key, reason] of Object.entries(figma))
        if (typeof reason !== 'string' || !reason.trim())
            throw new Error(`${file}: ${key} needs a non-empty reason`);
    return { figma };
}

// Fetches each checked package's library file, found through the entries' own URLs, and checks it.
// names labels every key a list can hold: a gone key only has its entry's name, a stale one its entry or item.
async function checkPackages(root: string, token: string) {
    const results = [];
    for (const [pkg, isTarget] of Object.entries(TARGETS) as [Pkg, (i: LibraryItem) => boolean][]) {
        const dir = join(root, 'packages', pkg);
        const entries = readEntries(dir);
        const fileKeys = new Set(Object.values(entries).map((e) => parseFigmaUrl(e.url).fileKey));
        const items = (
            await Promise.all(
                [...fileKeys].map(async (k) => {
                    const { sets, comps } = await fetchLibraryFile(k, token);
                    return libraryItems(sets, comps);
                }),
            )
        ).flat();
        const names = new Map([
            ...Object.entries(entries).map(([k, e]) => [k, e.name] as const),
            ...items.map((i) => [i.key, i.name] as const),
        ]);
        const lists = checkLibrary(items, entries, readExceptions(dir), isTarget);
        results.push({ pkg, lists, names });
    }
    return results;
}

// `figma-blueprint library`: one section per non-empty list, exit 1 when any list has a row.
export async function libraryCommand(root: string): Promise<number> {
    const token = figmaToken('the library files the Code Connect URLs point to');
    let failed = false;
    for (const { pkg, lists, names } of await checkPackages(root, token)) {
        const line = (key: string, name = names.get(key), page = '') =>
            `  ${key}  ${JSON.stringify(name ?? '')}${page && `  @${page}`}`;
        const sections = [
            ['entry no longer published in Figma', lists.gone.map((k) => line(k))],
            [
                'published in Figma, not in entries and not in figma-exceptions.json',
                lists.unconnected.map((i) => line(i.key, i.name, i.page)),
            ],
            [
                'stale exception (now linked or no longer published)',
                lists.stale.map((k) => line(k)),
            ],
        ] as const;
        for (const [title, rows] of sections) {
            if (!rows.length) continue;
            failed = true;
            console.log(`${pkg}: ${title} (${rows.length})\n${rows.join('\n')}`);
        }
    }
    if (!failed) console.log('every library component is linked or has a reason');
    return failed ? 1 : 0;
}
