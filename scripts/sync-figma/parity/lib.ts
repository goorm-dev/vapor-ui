/**
 * Shared helpers for the icon parity check.
 *
 * @see docs/research/figma-icon-visual-parity.md (814-icon measurement, 2026-08-28)
 * @see docs/research/icon-visual-parity-tooling.md (API facts, 2026-09-02)
 */
import { camelCase, startCase } from 'lodash-es';
import { existsSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const PARITY_DIR = path.dirname(fileURLToPath(import.meta.url));

function findRoot(dir: string): string {
    if (existsSync(path.join(dir, 'pnpm-workspace.yaml'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) throw new Error('Could not find project root');
    return findRoot(parent);
}

const REPO_ROOT = findRoot(PARITY_DIR);
const CACHE_DIR = path.join(PARITY_DIR, '.cache');

/** Written by fetch-baseline, read by compare — which icons are colour, straight from Figma. */
const MANIFEST = path.join(CACHE_DIR, 'manifest.json');

type Manifest = Record<string, { id: string; isColorIcon: boolean }>;

/**
 * Keep identical to `normalizeIconName` in commands/sync-icons.ts — the baseline file name
 * has to line up 1:1 with the generated component name.
 */
const FIGMA_EMOJI_PREFIX_PATTERN = /❤️\s*/g;
function normalizeIconName(name: string) {
    return startCase(camelCase(name.replace(FIGMA_EMOJI_PREFIX_PATTERN, ''))).replace(/ /g, '');
}

/** `--flag=value` / `--flag` parsing. No dependency needed. */
function flags(): Record<string, string> {
    const out: Record<string, string> = {};
    for (const arg of process.argv.slice(2)) {
        const m = /^--([^=]+)(?:=(.*))?$/.exec(arg);
        if (m) out[m[1]] = m[2] ?? 'true';
    }
    return out;
}

export type { Manifest };
export { CACHE_DIR, MANIFEST, PARITY_DIR, REPO_ROOT, flags, normalizeIconName };
