import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import pc from 'picocolors';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

import type { Manifest } from './lib';
import {
    CACHE_DIR,
    DIFF_GATE,
    MANIFEST,
    PIXELMATCH_OPTIONS,
    flags,
    nameSet,
    onlyFilter,
} from './lib';

type Row = {
    name: string;
    diffPixels: number;
    isColorIcon: boolean;
    width: number;
    height: number;
    failed: boolean;
};

const args = flags();
const threshold = Number(args.threshold ?? DIFF_GATE);
// Colour icons are rasterizer noise, not signal — gate them only to exercise the failure path.
const gateColor = args['gate-color'] === 'true';
const keep = onlyFilter(args.only);
// `--show=A,B` adds rows to the page without narrowing what gets compared. The sync workflow
// passes the icons it just changed, so a reviewer sees them next to Figma even on a green run.
// `--only` cannot do this job: it drops every other icon out of the gate as well.
const shown = args.show ? nameSet(args.show) : new Set<string>();

const baselineDir = path.join(CACHE_DIR, 'baseline');
const codeDir = path.join(CACHE_DIR, 'render');
const diffDir = path.join(CACHE_DIR, 'diff');
await fs.mkdir(diffDir, { recursive: true });

const manifest: Manifest = JSON.parse(await fs.readFile(MANIFEST, 'utf8').catch(() => '{}'));

// The expected name list comes from the *baseline* (what Figma actually has), never from the
// render output: enumerating our renders let a missing one vanish silently as
// `813 compared, skipped: []`.
const names = (await fs.readdir(baselineDir))
    .filter((f) => f.endsWith('.png'))
    .map((f) => f.slice(0, -4))
    .filter(keep)
    .sort();
if (!names.length) {
    throw new Error(
        `no baseline in ${baselineDir}${args.only ? ` matching --only=${args.only}` : ''} — run parity:fetch first`,
    );
}

const rows: Row[] = [];
const skipped: string[] = [];
const missing: string[] = [];
const unclassified: string[] = [];

for (const name of names) {
    const codeFile = path.join(codeDir, `${name}.png`);
    if (!(await fs.stat(codeFile).catch(() => null))) {
        missing.push(`${name} (no code render)`);
        continue;
    }
    const entry = manifest[name];
    if (!entry) {
        unclassified.push(name);
        continue;
    }

    const figma = PNG.sync.read(await fs.readFile(path.join(baselineDir, `${name}.png`)));
    const code = PNG.sync.read(await fs.readFile(codeFile));
    if (figma.width !== code.width || figma.height !== code.height) {
        skipped.push(`${name} (${figma.width}x${figma.height} vs ${code.width}x${code.height})`);
        continue;
    }

    const a = new Uint8Array(figma.data);
    const b = new Uint8Array(code.data);
    const diff = new PNG({ width: figma.width, height: figma.height });
    const diffPixels = pixelmatch(a, b, diff.data, figma.width, figma.height, {
        ...PIXELMATCH_OPTIONS,
        diffMask: true,
    });

    await fs.writeFile(path.join(diffDir, `${name}.png`), PNG.sync.write(diff));

    rows.push({
        name,
        diffPixels,
        isColorIcon: entry.isColorIcon,
        width: figma.width,
        height: figma.height,
        failed: (gateColor || !entry.isColorIcon) && diffPixels > threshold,
    });
}

rows.sort((x, y) => y.diffPixels - x.diffPixels);
const failures = rows.filter((row) => row.failed);
const mono = rows.filter((row) => !row.isColorIcon);
const color = rows.filter((row) => row.isColorIcon);
const worst = (group: Row[]) => Math.max(0, ...group.map((row) => row.diffPixels));
// What the HTML page will actually draw. An explicit --only shows every requested icon; otherwise
// failures first, then whatever --show asked for. The workflow uploads the page only when this is
// non-empty, so a green run never hands a reviewer a link to an empty table.
//
// Failures lead so the cap can never hide one: a sync that regenerates every icon marks all 814 as
// changed, and a page with 814 rows of inlined PNGs is several megabytes.
const MAX_DRAWN = 60;
const candidates = args.only
    ? rows
    : [...failures, ...rows.filter((row) => !row.failed && shown.has(row.name))];
const drawn = candidates.slice(0, MAX_DRAWN);
const folded = candidates.length - drawn.length;

// The headline counts live here, not only in the rendered page: the workflow reads them straight
// out of this file for the PR comment. Re-parsing a rendered report to recover numbers we already
// have is how the Playwright job ended up grepping its own markdown.
const report = {
    threshold,
    pixelmatch: PIXELMATCH_OPTIONS,
    total: rows.length,
    expected: names.length,
    failed: failures.length,
    rendered: drawn.length,
    mono: { count: mono.length, worst: worst(mono) },
    colour: { count: color.length, worst: worst(color) },
    skipped,
    missing,
    unclassified,
    rows,
};
await fs.writeFile(path.join(CACHE_DIR, 'report.json'), JSON.stringify(report, null, 2));

// Self-contained HTML (images inlined) so the one file the workflow uploads to S3 opens on its
// own. The plain lists below cover the failure causes that have no image to show.
const dataUri = async (file: string) =>
    `data:image/png;base64,${(await fs.readFile(file)).toString('base64')}`;
const cell = async (dir: string, name: string) =>
    `<td><img src="${await dataUri(path.join(dir, `${name}.png`))}"></td>`;
const htmlRows = await Promise.all(
    drawn.map(
        async (row) =>
            `<tr><th>${row.name}${row.failed ? ' <b>FAIL</b>' : ''}` +
            `<br><small>${row.diffPixels} px</small></th>` +
            (await cell(baselineDir, row.name)) +
            (await cell(codeDir, row.name)) +
            (await cell(diffDir, row.name)) +
            '</tr>',
    ),
);
const htmlList = (label: string, list: string[]) =>
    list.length
        ? `<h2>${label} (${list.length})</h2><ul>${list.map((i) => `<li>${i}</li>`).join('')}</ul>`
        : '';
await fs.writeFile(
    path.join(CACHE_DIR, 'report.html'),
    `<!doctype html><meta charset="utf-8"><title>Icon parity report</title>
<style>
body{font:14px system-ui;margin:2rem}th{text-align:left;padding:.5rem 1rem}
td{padding:.5rem;background:repeating-conic-gradient(#eee 0 25%,#fff 0 50%) 0 0/16px 16px}
img{display:block;width:128px;height:128px;image-rendering:pixelated}
</style>
<h1>Icon parity report</h1>
<p>${failures.length} of ${mono.length} mono icons over ${threshold} diff pixels (worst ${worst(mono)}).<br>
${color.length} colour icons are reported but not gated — Figma and Chromium disagree on these (worst ${worst(color)}).</p>
${shown.size ? '<p>Rows without <b>FAIL</b> are icons this sync changed. They are here for review, not because anything is wrong with them.</p>' : ''}
<table><tr><th></th><th>Figma</th><th>Code</th><th>Diff</th></tr>${htmlRows.join('')}</table>
${folded ? `<p>${folded} more row(s) not drawn — the page is capped at ${MAX_DRAWN}.</p>` : ''}
${htmlList('missing renders', missing)}${htmlList('skipped (size mismatch)', skipped)}${htmlList('not in manifest', unclassified)}`,
);

console.log(
    `${rows.length}/${names.length} compared — mono ${mono.length} (worst ${worst(mono)}), ` +
        `colour ${color.length} (worst ${worst(color)}, ungated), ` +
        `${pc.red(String(failures.length))} over ${threshold}` +
        (skipped.length ? `, ${skipped.length} skipped` : '') +
        (missing.length ? `, ${pc.red(`${missing.length} missing`)}` : ''),
);
console.log(`report: ${path.join(CACHE_DIR, 'report.html')}`);
console.log(`diffs:  ${diffDir} (${rows.length} PNGs)`);
if (failures.length) {
    console.error(
        pc.red(
            `mono icons over ${threshold} diff pixels:\n  ` +
                failures.map((row) => `${row.name} (${row.diffPixels})`).join('\n  '),
        ),
    );
}
if (missing.length) console.error(pc.red(`missing renders:\n  ${missing.join('\n  ')}`));
if (unclassified.length) {
    console.error(pc.red(`not in manifest (re-run parity:fetch):\n  ${unclassified.join('\n  ')}`));
}
if (failures.length || missing.length || skipped.length || unclassified.length) {
    process.exitCode = 1;
}
