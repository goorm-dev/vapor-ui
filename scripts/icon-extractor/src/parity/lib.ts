/**
 * Shared settings for the icon parity check: fetch a Figma PNG per icon, render our component
 * to a PNG the same size in Chromium, and count differing pixels with pixelmatch.
 *
 * The four values below (canvas size, includeAA, threshold, gate) were measured across all 594
 * mono icons, not guessed. Each carries the measurement that fixed it — read those before
 * changing one, because the failure they guard against is silent: a gate that is too loose
 * passes a shifted icon without a word.
 */
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const PARITY_DIR = path.dirname(fileURLToPath(import.meta.url));
/** Override to hold a cache fetched at another `--scale` without clobbering the main one. */
const CACHE_DIR = process.env.PARITY_CACHE_DIR ?? path.join(PARITY_DIR, '.cache');

/** Written by fetch-baseline, read by compare — which icons are colour, straight from Figma. */
const MANIFEST = path.join(CACHE_DIR, 'manifest.json');

type Manifest = Record<string, { id: string; isColorIcon: boolean }>;

/**
 * `includeAA: true` reads backwards: `false` is pixelmatch's default and turns its anti-aliasing
 * detector ON. A thin line moved by 1px changes only edge pixels, which that detector always
 * classifies as anti-aliasing and drops — 253 of 594 mono icons could move a full pixel and
 * still score ≤1. `true` skips the detector and counts every pixel over the threshold.
 *
 * `threshold: 0.3` is an alpha difference of 79 for these icons (mono icons are pure black, so
 * pixelmatch's YIQ distance collapses to the alpha delta). 99.8% of rasterizer-noise pixels fall
 * below it and 62% of the pixels a 1px shift moves fall above it. Lower and noise leaks in;
 * higher (0.4) and the smallest real shifts score 2, colliding with noise.
 */
const PIXELMATCH_OPTIONS = { threshold: 0.3, includeAA: true } as const;

/**
 * Fail above this many differing pixels. Measured 2026-09-07 over all 594 mono icons: a correct
 * icon scores at most 2 (DividerOutlineIcon), and the smallest defect worth catching — the source
 * shifted 0.25 units, i.e. 1px on the 64px canvas — scores at least 4 (MinusOutlineIcon). The
 * gate sits at the noise ceiling rather than halfway between: a silent miss costs more than a
 * false alarm you can see in the PR.
 *
 * 64×64 is the only canvas where those two ranges separate. At 16px a 0.25-unit shift flips no
 * pixel at all, and at 32px the best setting leaves signal min 1 against noise max 1. It is also
 * Figma's maximum `scale`, and both sides rasterize the vector directly — no resampling.
 *
 * Re-measure if Chromium, Playwright, the icon bundle or Figma's renderer changes.
 */
const DIFF_GATE = 2;

/** `--flag=value` / `--flag` parsing. No dependency needed. */
function flags(): Record<string, string> {
    const out: Record<string, string> = {};
    for (const arg of process.argv.slice(2)) {
        const m = /^--([^=]+)(?:=(.*))?$/.exec(arg);
        if (m) out[m[1]] = m[2] ?? 'true';
    }
    return out;
}

/**
 * `--only=A,B` keeps just those icon names; without the flag everything passes.
 *
 * Empty entries are dropped so a caller can pass a list stitched from several sources —
 * `format('{0},{1}', ...)` in a workflow yields `A,,B` when one source is empty.
 */
function nameSet(list: string): Set<string> {
    return new Set(list.split(',').filter(Boolean));
}

function onlyFilter(only: string | undefined): (name: string) => boolean {
    if (!only) return () => true;
    const wanted = nameSet(only);
    return (name) => wanted.has(name);
}

export type { Manifest };
export {
    CACHE_DIR,
    DIFF_GATE,
    MANIFEST,
    PARITY_DIR,
    PIXELMATCH_OPTIONS,
    flags,
    nameSet,
    onlyFilter,
};
