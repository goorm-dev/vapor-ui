#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { FigmaTree } from './expected';
import { expectedSet } from './expected';
import { buildPackage, fromInstalled, fromRepo } from './library';
import { parseFigmaUrl, writeEntries } from './map';

const USAGE = `usage: figma-blueprint expected <tree.json | figma URL> [--repo <root>]
       figma-blueprint map [--repo <root>]
       figma-blueprint build

Without --repo, templates and tables come from the @vapor-ui packages installed in the current directory.
build runs in packages/core, composites or icons and writes their figma-blueprint/ folder.`;

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
    const flags = new Map<string, string>();
    const positional: string[] = [];
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (a === '--repo') flags.set(a, argv[++i]);
        else positional.push(a);
    }
    return { positional, repo: flags.get('--repo') };
}

async function map(root: string) {
    const token = process.env.FIGMA_ACCESS_TOKEN;
    if (!token) {
        console.error(
            'figma-blueprint map: FIGMA_ACCESS_TOKEN is not set. It needs read access to the library files the Code Connect URLs point to.',
        );
        process.exit(1);
    }
    const { counts, unpublished } = await writeEntries(root, token).catch((e: Error) => {
        console.error(`figma-blueprint map: ${e.message}`);
        process.exit(1);
    });
    for (const [pkg, n] of Object.entries(counts))
        console.log(`packages/${pkg}/figma-entries.json  ${n} entries`);
    if (unpublished.length) {
        console.error(`not published in Figma, so left out:\n  ${unpublished.join('\n  ')}`);
        process.exit(1);
    }
}

const { positional, repo } = parseArgs(process.argv.slice(2));
const [command, src] = positional;
if (command === 'map') {
    await map(repo ?? process.cwd());
    process.exit(0);
}
if (command === 'build') {
    try {
        buildPackage(process.cwd(), join(process.cwd(), 'figma-blueprint'));
    } catch (e) {
        console.error(`figma-blueprint build: ${(e as Error).message}`);
        process.exit(1);
    }
    process.exit(0);
}
if (command !== 'expected' || !src) {
    console.error(USAGE);
    process.exit(1);
}

const library = repo ? await fromRepo(repo) : await fromInstalled(process.cwd());
const expected = expectedSet(await loadTree(src), library);

const unscorable = expected.unscorable.map(
    (u) => `${u.name} (${u.node}): ${u.cause}${u.message ? ` ${u.message}` : ''}`,
);
console.log(expected.lines.map((l) => l.line).join('\n'));
if (unscorable.length) console.error(`unscorable:\n  ${unscorable.join('\n  ')}`);
