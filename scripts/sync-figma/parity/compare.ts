/**
 * Step 3 — compare our render against Figma's and report.
 *
 * Usage:
 *   tsx parity/compare.ts [--threshold=N]
 *
 * The metric is pixelmatch's diff pixel count. pixelmatch skips pixels it can explain as
 * antialiasing, which is what makes the count usable across two different rasterizers: on the
 * 578 mono icons measured 2026-09-02, 573 scored 0 and the rest scored 1.
 *
 * ONLY MONO ICONS ARE GATED. Figma and Chromium disagree far more on colour icons (flags, logos:
 * p90 50, max 289 diff pixels with nothing wrong), so those are reported and never failed.
 *
 * What this check does NOT catch: pixelmatch's antialiasing skip also hides a sub-pixel shift —
 * a synthetic 1px translation at 64px goes unnoticed on 345 of 1156 mono cases (measured). It
 * catches what a human would see, not every geometry change. Conversion-level regressions are
 * covered offline by src/integrations/figma/svgr.test.ts.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import pc from 'picocolors';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

import type { Manifest } from './lib';
import { CACHE_DIR, MANIFEST, flags } from './lib';

/** pixelmatch v7 threshold is an OKLab HyAB distance — do not copy pre-v7 (YIQ) numbers. */
const PIXELMATCH_THRESHOLD = 0.1;

/**
 * A mono icon fails above this many diff pixels. 1 is the measured maximum across 578 mono icons
 * at scale=4, so this is the tightest line with no false failure; a real defect is orders of
 * magnitude above it (a wrong icon reads in the thousands).
 */
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

    // Copy into fresh arrays: pixelmatch builds a Uint32Array view, and a pooled Buffer's
    // byteOffset is not guaranteed to be 4-aligned.
    const a = new Uint8Array(figma.data);
    const b = new Uint8Array(code.data);
    const diff = new PNG({ width: figma.width, height: figma.height });
    const diffPixels = pixelmatch(a, b, diff.data, figma.width, figma.height, {
        threshold: PIXELMATCH_THRESHOLD,
        diffMask: true,
    });
    // Always write the diff mask, not just for failures: colour icons are never failed, so this
    // is the only artifact there is to look at for them.
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
    console.error(
        pc.red(`not in manifest (re-run parity:fetch):\n  ${unclassified.join('\n  ')}`),
    );
}
if (failures.length || missing.length || skipped.length || unclassified.length) {
    process.exitCode = 1;
}
