import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { codeConnectFiles } from './build';
import type { Batch } from './figma-mock';
import { PACKAGES, readEntries } from './library';
import type { Pkg, StoredEntry } from './library';

type Connection = Omit<StoredEntry, 'name'>;

// Every Code Connect entry a package ships: a `*.figma.ts` with a `// url=` header, or one row of a
// `*.figma.batch.json`. template is relative to pkgDir.
function connections(pkgDir: string): Connection[] {
    return codeConnectFiles(pkgDir).flatMap((f): Connection[] => {
        const text = readFileSync(join(pkgDir, f), 'utf8');
        if (!f.endsWith('.json')) {
            const url = text.match(/^\/\/ url=(\S+)/m)?.[1];
            return url ? [{ url, template: f, batch: null }] : [];
        }
        const { templateFile, components } = JSON.parse(text) as {
            templateFile: string;
            components: (Batch & { url: string })[];
        };
        const template = join(dirname(f), templateFile);
        return components.map((batch) => ({ url: batch.url, template, batch }));
    });
}

// Code Connect URLs whose entry, as the package's source states it now (url, template, batch row), is not in its
// figma-entries.json. Rerun `figma-eval map` to add them.
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

const nodeOf = (url: string) => {
    const u = new URL(url);
    return `${u.pathname.split('/')[2]}/${(u.searchParams.get('node-id') ?? '').replace('-', ':')}`;
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
