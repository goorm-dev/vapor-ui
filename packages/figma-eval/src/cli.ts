#!/usr/bin/env node
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

import { compare } from './compare';
import type { FigmaTree } from './expected';
import { expectedSet } from './expected';
import { buildPackage, fromInstalled, fromRepo } from './library';
import { parseFigmaUrl, writeEntries } from './map';
import { checkStyling } from './styling';

const USAGE = `usage: figma-eval expected <tree.json | figma URL> [--repo <root>]
       figma-eval compare <tree.json | figma URL> <paths...> [--json] [--repo <root>]
       figma-eval styling <files...> [--json]
       figma-eval map [--repo <root>]
       figma-eval build

Without --repo, templates and tables come from the @vapor-ui packages installed in the current directory.
styling checks the given files for absolute positioning and hardcoded values; pass only the files that changed.
build runs in packages/core, composites or icons and writes their figma-eval/ folder.
compare exits 0 on pass, 1 on fail, 2 when the design cannot be graded.`;

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

const sourcePaths = (p: string) =>
    statSync(p).isDirectory()
        ? readdirSync(p, { recursive: true, encoding: 'utf8' })
              .filter((f) => /\.[jt]sx?$/.test(f) && !f.includes('node_modules'))
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
if (command === 'build') {
    try {
        buildPackage(process.cwd(), join(process.cwd(), 'figma-eval'));
    } catch (e) {
        console.error(`figma-eval build: ${(e as Error).message}`);
        process.exit(1);
    }
    process.exit(0);
}
if (command === 'styling' && src) {
    const result = checkStyling(
        positional.slice(1).map((path) => ({ path, text: readFileSync(path, 'utf8') })),
    );
    if (json) console.log(JSON.stringify(result, null, 2));
    else {
        const { absolute, hardcoded, exempt } = result;
        console.log(
            result.result === 'pass'
                ? '관문 2 통과'
                : `관문 2 실패  absolute ${absolute.length}, 하드코딩 ${hardcoded.length}`,
        );
        for (const h of absolute) console.log(`absolute  ${h.at}  ${h.text}`);
        for (const h of hardcoded) console.log(`하드코딩  ${h.at}  ${h.text}`);
        console.log(
            `예외(관문 제외): 에셋 ${exempt.asset.length}, sr-only ${exempt.srOnly.length}, 1px 테두리 ${exempt.border1px.length}, 토큰 눈금 밖 px ${exempt.untokenized.length}, 입력창 아이콘 ${exempt.inputIcon.length}`,
        );
    }
    process.exit(result.result === 'pass' ? 0 : 1);
}
if ((command !== 'expected' && command !== 'compare') || !src) {
    console.error(USAGE);
    process.exit(1);
}

const library = repo ? await fromRepo(repo) : await fromInstalled(process.cwd());
const expected = expectedSet(await loadTree(src), library);

const unscorable = expected.unscorable.map(
    (u) => `${u.name} (${u.node}): ${u.cause}${u.message ? ` ${u.message}` : ''}`,
);
if (command === 'expected') {
    console.log(expected.lines.map((l) => l.line).join('\n'));
    if (unscorable.length) console.error(`unscorable:\n  ${unscorable.join('\n  ')}`);
} else {
    // rows[].at is relative to where figma-eval runs.
    const files = paths.flatMap(sourcePaths).map((path) => ({
        path: relative(process.cwd(), path),
        text: readFileSync(path, 'utf8'),
    }));
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
        if (result.excluded.length)
            console.log(
                `제외: ${result.excluded.map((e) => `${e.name} (${e.reason})`).join(', ')}`,
            );
        if (unscorable.length) console.log(`채점 불가:\n  ${unscorable.join('\n  ')}`);
    }
    process.exitCode = { pass: 0, fail: 1, unscorable: 2 }[result.result];
}
