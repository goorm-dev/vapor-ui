import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { Blueprint, BlueprintNode, FigmaTree } from './blueprint/blueprint';
import { blueprint } from './blueprint/blueprint';
import { parseFigmaUrl, writeEntries } from './entries/map';
import { fromInstalled, fromRepo } from './library/library';
import { buildPackage } from './ship/ship';

const USAGE = `usage: figma-blueprint <tree.json | figma URL> [--json] [--repo <root>]
       figma-blueprint entries [--repo <root>]
       figma-blueprint ship

Prints the elements the design requires, one per line with the Figma node id it came from.
Without --repo, templates and tables come from the @vapor-ui packages installed in the current directory.
Exits 2 when an instance could not be read (unscorable), so the design cannot be fully graded.
ship runs in packages/core, composites or icons and writes their figma-blueprint/ folder.
FIGMA_ACCESS_TOKEN is read from the environment or a .env file in the current directory.`;

async function loadTree(arg: string): Promise<FigmaTree> {
    if (!arg.startsWith('http')) return JSON.parse(readFileSync(arg, 'utf8')) as FigmaTree;
    const { fileKey, nodeId } = parseFigmaUrl(arg);
    const r = await fetch(
        `https://api.figma.com/v1/files/${fileKey}/nodes?ids=${encodeURIComponent(nodeId)}`,
        {
            headers: { 'X-Figma-Token': process.env.FIGMA_ACCESS_TOKEN ?? '' },
        },
    );
    if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
    return ((await r.json()) as { nodes: Record<string, FigmaTree> }).nodes[nodeId];
}

function parseArgs(argv: string[]) {
    const positional: string[] = [];
    let json = false;
    let repo: string | undefined;
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (a === '--json') json = true;
        else if (a === '--repo') repo = argv[++i];
        else positional.push(a);
    }
    return { positional, json, repo };
}

async function entries(root: string) {
    const token = process.env.FIGMA_ACCESS_TOKEN;
    if (!token)
        throw new Error(
            'FIGMA_ACCESS_TOKEN is not set. It needs read access to the library files the Code Connect URLs point to.',
        );
    const { counts, unpublished } = await writeEntries(root, token);
    for (const [pkg, n] of Object.entries(counts))
        console.log(`packages/${pkg}/figma-entries.json  ${n} entries`);
    if (!unpublished.length) return 0;
    console.error(`not published in Figma, so left out:\n  ${unpublished.join('\n  ')}`);
    return 1;
}

// A node, then its children two spaces in, as the code writes them.
function text({ nodes, excluded, unscorable }: Blueprint) {
    const out: string[] = [];
    const walk = (list: BlueprintNode[], depth: number) => {
        for (const n of list) {
            const jsx = `<${[n.tag, ...n.props].join(' ')} />`;
            out.push(`${'  '.repeat(depth)}${jsx}  ${n.id}${n.anyParent ? '  (any parent)' : ''}`);
            walk(n.children, depth + 1);
        }
    };
    walk(nodes, 0);
    if (excluded.length)
        out.push('excluded:', ...excluded.map((e) => `  ${e.name} (${e.node}): ${e.reason}`));
    if (unscorable.length)
        out.push(
            'unscorable:',
            ...unscorable.map(
                (u) => `  ${u.name} (${u.node}): ${u.cause}${u.message ? ` ${u.message}` : ''}`,
            ),
        );
    return out.join('\n');
}

async function run(argv: string[]) {
    if (existsSync('.env')) process.loadEnvFile();
    const { positional, json, repo } = parseArgs(argv);
    const [command] = positional;
    if (command === 'entries') return entries(repo ?? process.cwd());
    if (command === 'ship') {
        buildPackage(process.cwd(), join(process.cwd(), 'figma-blueprint'));
        return 0;
    }
    if (!command || positional.length > 1) {
        console.error(USAGE);
        return 1;
    }
    const library = repo ? await fromRepo(repo) : await fromInstalled(process.cwd());
    const result = blueprint(await loadTree(command), library);
    console.log(json ? JSON.stringify(result, null, 2) : text(result));
    return result.unscorable.length ? 2 : 0;
}

// The exit code; bin/figma-blueprint.mjs sets it.
export async function main(argv: string[]): Promise<number> {
    try {
        return await run(argv);
    } catch (e) {
        console.error(`figma-blueprint: ${(e as Error).message}`);
        return 1;
    }
}
