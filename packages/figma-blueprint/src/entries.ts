// packages/<pkg>/figma-entries.json: which Code Connect template each Figma component (set) key runs. Keys only exist
// in Figma, so `figma-blueprint entries` asks Figma for them and the result is committed; everything else reads it.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { connections } from '~/code-connect/files';
import type { CodeConnectEntry } from '~/code-connect/files';
import { fetchLibraryFile, figmaToken, parseFigmaUrl } from '~/figma';
import type { Published } from '~/figma';
import { PACKAGES } from '~/packages';
import type { Pkg } from '~/packages';

// What `figma-blueprint entries` writes to packages/<pkg>/figma-entries.json, keyed by Figma component (set) key.
// template is relative to the package directory.
export interface StoredEntry extends CodeConnectEntry {
    name: string;
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

// node id → published component (set), for every library file a URL points into.
async function publishedByNode(fileKeys: Set<string>, token: string) {
    const byNode = new Map<string, Published>();
    await Promise.all(
        [...fileKeys].map(async (fileKey) => {
            const { sets, comps } = await fetchLibraryFile(fileKey, token);
            for (const c of [...comps, ...sets]) byNode.set(`${fileKey}/${c.node_id}`, c);
        }),
    );
    return byNode;
}

const nodeOf = (url: string) => {
    const { fileKey, nodeId } = parseFigmaUrl(url);
    return `${fileKey}/${nodeId}`;
};

// Writes packages/<pkg>/figma-entries.json for core, composites and icons: every Code Connect entry keyed by the Figma
// component (set) key its URL resolves to. Keys only exist in Figma, so this is the one step that needs a token.
// Output is sorted, so a rerun with no Figma or repo change leaves the files byte-identical.
async function writeEntries(root: string, token: string) {
    const pkgs = PACKAGES.map((pkg) => {
        const dir = join(root, 'packages', pkg);
        return { pkg, dir, list: connections(dir) };
    });
    const byNode = await publishedByNode(
        new Set(pkgs.flatMap(({ list }) => list.map((c) => nodeOf(c.url).split('/')[0]))),
        token,
    );

    const counts = {} as Record<Pkg, number>;
    const unpublished: string[] = [];
    for (const { pkg, dir, list } of pkgs) {
        const entries: Record<string, StoredEntry> = {};
        for (const c of list) {
            const p = byNode.get(nodeOf(c.url));
            if (p) entries[p.key] = { name: p.name, ...c };
            else unpublished.push(c.url);
        }
        const sorted = Object.fromEntries(
            Object.keys(entries)
                .sort()
                .map((k) => [k, entries[k]]),
        );
        writeFileSync(join(dir, 'figma-entries.json'), `${JSON.stringify(sorted, null, 4)}\n`);
        counts[pkg] = Object.keys(sorted).length;
    }
    return { counts, unpublished };
}

// `figma-blueprint entries`: exits 1 when a Code Connect URL points at nothing published, which is left out.
export async function entriesCommand(root: string): Promise<number> {
    const token = figmaToken('the library files the Code Connect URLs point to');
    const { counts, unpublished } = await writeEntries(root, token);
    for (const [pkg, n] of Object.entries(counts))
        console.log(`packages/${pkg}/figma-entries.json  ${n} entries`);
    if (!unpublished.length) return 0;
    console.error(`not published in Figma, so left out:\n  ${unpublished.join('\n  ')}`);
    return 1;
}
