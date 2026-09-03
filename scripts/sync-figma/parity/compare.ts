import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import pc from 'picocolors';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

import type { Manifest } from './lib';
import { CACHE_DIR, MANIFEST, flags } from './lib';

const PIXELMATCH_THRESHOLD = 0.1;

const DEFAULT_THRESHOLD = 1;

type Row = {
    name: string;
    diffPixels: number;
    isColorIcon: boolean;
    width: number;
    height: number;
    failed: boolean;
};

const args = flags();
const threshold = Number(args.threshold ?? DEFAULT_THRESHOLD);

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
    .sort();
if (!names.length) throw new Error(`no baseline in ${baselineDir} — run parity:fetch first`);

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
        threshold: PIXELMATCH_THRESHOLD,
        diffMask: true,
    });

    await fs.writeFile(path.join(diffDir, `${name}.png`), PNG.sync.write(diff));

    rows.push({
        name,
        diffPixels,
        isColorIcon: entry.isColorIcon,
        width: figma.width,
        height: figma.height,
        failed: !entry.isColorIcon && diffPixels > threshold,
    });
}

rows.sort((x, y) => y.diffPixels - x.diffPixels);
const failures = rows.filter((row) => row.failed);
const mono = rows.filter((row) => !row.isColorIcon);
const color = rows.filter((row) => row.isColorIcon);
const report = {
    threshold,
    pixelmatchThreshold: PIXELMATCH_THRESHOLD,
    total: rows.length,
    expected: names.length,
    failed: failures.length,
    skipped,
    missing,
    unclassified,
    rows,
};
await fs.writeFile(path.join(CACHE_DIR, 'report.json'), JSON.stringify(report, null, 2));

const worst = (group: Row[]) => Math.max(0, ...group.map((row) => row.diffPixels));
const lines = [
    `# Icon parity report`,
    '',
    `Our render vs Figma's own PNG, diff measured in pixelmatch pixels.`,
    '',
    `- gated: **${mono.length} mono** icons, fail above ${threshold} diff pixels — ` +
        `${failures.length} failing, worst ${worst(mono)}`,
    `- ungated: ${color.length} colour icons (Figma and Chromium disagree on these), ` +
        `worst ${worst(color)}`,
    ...(skipped.length ? [`- ${skipped.length} skipped (size mismatch)`] : []),
    ...(missing.length ? [`- **${missing.length} MISSING** renders`] : []),
    ...(unclassified.length ? [`- **${unclassified.length} not in manifest**`] : []),
    '',
    `| Icon | kind | diff px | size |`,
    `| --- | --- | ---: | --- |`,
    ...rows
        .slice(0, 60)
        .map(
            (row) =>
                `| ${row.name}${row.failed ? ' **FAIL**' : ''} | ` +
                `${row.isColorIcon ? 'colour' : 'mono'} | ${row.diffPixels} | ` +
                `${row.width}x${row.height} |`,
        ),
];
for (const [label, list] of [
    ['skipped', skipped],
    ['missing', missing],
    ['unclassified', unclassified],
] as const) {
    if (list.length) lines.push('', `### ${label}`, ...list.map((item) => `- ${item}`));
}
await fs.writeFile(path.join(CACHE_DIR, 'report.md'), lines.join('\n') + '\n');

// Self-contained HTML (images inlined) so a CI artifact opens with no extra files.
// Only failing rows carry images; the plain lists below cover the other failure causes.
const dataUri = async (file: string) =>
    `data:image/png;base64,${(await fs.readFile(file)).toString('base64')}`;
const cell = async (dir: string, name: string) =>
    `<td><img src="${await dataUri(path.join(dir, `${name}.png`))}"></td>`;
const htmlRows = await Promise.all(
    failures.map(
        async (row) =>
            `<tr><th>${row.name}<br><small>${row.diffPixels} px</small></th>` +
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
<p>${failures.length} of ${mono.length} mono icons over ${threshold} diff pixels.</p>
<table><tr><th></th><th>Figma</th><th>Code</th><th>Diff</th></tr>${htmlRows.join('')}</table>
${htmlList('missing renders', missing)}${htmlList('skipped (size mismatch)', skipped)}${htmlList('not in manifest', unclassified)}`,
);

console.log(
    `${rows.length}/${names.length} compared — mono ${mono.length} (worst ${worst(mono)}), ` +
        `colour ${color.length} (worst ${worst(color)}, ungated), ` +
        `${pc.red(String(failures.length))} over ${threshold}` +
        (skipped.length ? `, ${skipped.length} skipped` : '') +
        (missing.length ? `, ${pc.red(`${missing.length} missing`)}` : ''),
);
console.log(`report: ${path.join(CACHE_DIR, 'report.md')}`);
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
