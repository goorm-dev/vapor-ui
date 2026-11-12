import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { connections } from './code-connect';
import { PACKAGES } from './entries-file';
import type { Pkg, StoredEntry } from './entries-file';

interface Published {
    key: string;
    name: string;
    node_id: string;
}

// node id → published component (set), for every library file a URL points into.
async function publishedByNode(fileKeys: Set<string>, token: string) {
    const get = async <T>(path: string): Promise<T> => {
        const r = await fetch(`https://api.figma.com/v1/${path}`, {
            headers: { 'X-Figma-Token': token },
        });
        if (!r.ok) throw new Error(`GET ${path}: ${r.status} ${await r.text()}`);
        return (await r.json()) as T;
    };
    const byNode = new Map<string, Published>();
    await Promise.all(
        [...fileKeys].map(async (fileKey) => {
            const [sets, comps] = await Promise.all([
                get<{ meta: { component_sets: Published[] } }>(`files/${fileKey}/component_sets`),
                get<{ meta: { components: Published[] } }>(`files/${fileKey}/components`),
            ]);
            for (const c of [...comps.meta.components, ...sets.meta.component_sets])
                byNode.set(`${fileKey}/${c.node_id}`, c);
        }),
    );
    return byNode;
}

// A Figma design URL's file (its branch, on a branch URL) and node: node-id=I529-7899%3B2847-43442 is I529:7899;2847:43442.
export const parseFigmaUrl = (url: string) => {
    const u = new URL(url);
    const path = u.pathname.split('/');
    return {
        fileKey: path[3] === 'branch' ? path[4] : path[2],
        nodeId: (u.searchParams.get('node-id') ?? '').replaceAll('-', ':'),
    };
};

const nodeOf = (url: string) => {
    const { fileKey, nodeId } = parseFigmaUrl(url);
    return `${fileKey}/${nodeId}`;
};

// Writes packages/<pkg>/figma-entries.json for core, composites and icons: every Code Connect entry keyed by the Figma
// component (set) key its URL resolves to. Keys only exist in Figma, so this is the one step that needs a token.
// Output is sorted, so a rerun with no Figma or repo change leaves the files byte-identical.
export async function writeEntries(root: string, token: string) {
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
