#!/usr/bin/env node
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { compare } from './compare';
import type { FigmaTree } from './expected';
import { expectedSet } from './expected';
import { fromRepo } from './library';
import { writeEntries } from './map';

const USAGE = `usage: figma-eval expected <tree.json | figma URL> --repo <root>
       figma-eval compare <tree.json | figma URL> <paths...> [--json] --repo <root>
       figma-eval map [--repo <root>]`;

async function loadTree(arg: string): Promise<FigmaTree> {
    if (!arg.startsWith('http')) return JSON.parse(readFileSync(arg, 'utf8')) as FigmaTree;
    const u = new URL(arg);
    const fileKey = u.pathname.split('/')[2];
    const nodeId = (u.searchParams.get('node-id') ?? '').replace('-', ':');
    const r = await fetch(`https://api.figma.com/v1/files/${fileKey}/nodes?ids=${nodeId}`, {
        headers: { 'X-Figma-Token': process.env.FIGMA_ACCESS_TOKEN ?? '' },
    });
    if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
    return ((await r.json()) as { nodes: Record<string, FigmaTree> }).nodes[nodeId];
}

const sourcePaths = (p: string) =>
    statSync(p).isDirectory()
        ? readdirSync(p, { recursive: true, encoding: 'utf8' })
              .filter((f) => /\.tsx?$/.test(f) && !f.includes('node_modules'))
              .map((f) => join(p, f))
        : [p];

function parseArgs(argv: string[]) {
    const flags = new Map<string, string>();
    const positional: string[] = [];
    let json = false;
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (a === '--json') json = true;
        else if (a === '--repo') flags.set(a, argv[++i]);
        else positional.push(a);
    }
    return { positional, json, repo: flags.get('--repo') };
}

async function map(root: string) {
    const token = process.env.FIGMA_ACCESS_TOKEN;
    if (!token) {
        console.error(
            'figma-eval map: FIGMA_ACCESS_TOKEN is not set. It needs read access to the library files the Code Connect URLs point to.',
        );
        process.exit(1);
    }
    const { counts, unpublished } = await writeEntries(root, token).catch((e: Error) => {
        console.error(`figma-eval map: ${e.message}`);
        process.exit(1);
    });
    for (const [pkg, n] of Object.entries(counts))
        console.log(`packages/${pkg}/figma-entries.json  ${n} entries`);
    if (unpublished.length) {
        console.error(`not published in Figma, so left out:\n  ${unpublished.join('\n  ')}`);
        process.exit(1);
    }
}

const { positional, json, repo } = parseArgs(process.argv.slice(2));
const [command, src, ...paths] = positional;
if (command === 'map') {
    await map(repo ?? process.cwd());
    process.exit(0);
}
if ((command !== 'expected' && command !== 'compare') || !src || !repo) {
    console.error(USAGE);
    process.exit(1);
}

const library = await fromRepo(repo);
const expected = expectedSet(await loadTree(src), library);

if (command === 'expected') {
    const { lines, errors, unmapped } = expected;
    console.log(lines.join('\n'));
    if (unmapped.length) console.error('unmapped, so not expected:', unmapped.join(', '));
    if (errors.length) console.error('template errors:\n  ' + errors.join('\n  '));
} else {
    const files = paths
        .flatMap(sourcePaths)
        .map((path) => ({ path, text: readFileSync(path, 'utf8') }));
    const result = compare(expected, files, library.tables);
    if (json) console.log(JSON.stringify(result, null, 2));
    else {
        console.log(`재현율 ${result.ok}/${result.total} (${result.recall.toFixed(2)})`);
        for (const r of result.rows)
            if (r.status === 'mismatch')
                console.log(
                    `props 불일치  ${r.line}\n              ${r.diff.join(', ')}  (${r.closest})`,
                );
        for (const r of result.rows)
            if (r.status === 'missing') console.log(`없음          ${r.line}`);
        if (result.unmapped.length)
            console.log(`연결 안 됨(정답에서 제외): ${result.unmapped.join(', ')}`);
        if (result.errors.length) console.log(`템플릿 오류:\n  ${result.errors.join('\n  ')}`);
    }
}
