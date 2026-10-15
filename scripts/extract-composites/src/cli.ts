#!/usr/bin/env tsx
import { config as loadEnv } from 'dotenv';
import meow from 'meow';
import { execSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';

import { extract } from './extractor.ts';
import { parseFigmaUrl } from './url.ts';

function findRepoRoot(): string {
    try {
        return execSync('git rev-parse --show-toplevel', { encoding: 'utf8' }).trim();
    } catch {
        return process.cwd();
    }
}
function findMainRepoRoot(): string {
    try {
        const commonDir = execSync('git rev-parse --git-common-dir', { encoding: 'utf8' }).trim();
        return dirname(resolve(commonDir));
    } catch {
        return findRepoRoot();
    }
}
const REPO_ROOT = findRepoRoot();
const MAIN_REPO_ROOT = findMainRepoRoot();
loadEnv({ path: resolve(REPO_ROOT, '.env') });
if (!process.env.FIGMA_TOKEN && MAIN_REPO_ROOT !== REPO_ROOT) {
    loadEnv({ path: resolve(MAIN_REPO_ROOT, '.env') });
}

const cli = meow(
    `
    Usage
      $ extract-composites <figma-url> [options]

    Options
      --slug <slug>       Output slug (default: kebabCase of Figma canvas name)
      --label <label>     Code Connect label (default: React)
      --skip <names>      Comma-separated section names to skip
      --output <dir>      Output root (default: apps/website/public/composites)
      --clean             Remove slug directory before extraction

    Env
      FIGMA_TOKEN         Required. Loaded via dotenv from CWD .env or shell env.
    `,
    {
        importMeta: import.meta,
        flags: {
            slug: { type: 'string' },
            label: { type: 'string', default: 'React' },
            skip: { type: 'string' },
            output: { type: 'string' },
            clean: { type: 'boolean', default: false },
        },
    },
);

const [figmaUrl] = cli.input;
if (!figmaUrl) {
    cli.showHelp(1);
    process.exit(1);
}

const token = process.env.FIGMA_TOKEN;
if (!token) {
    console.error('FIGMA_TOKEN missing. Set via .env or shell env.');
    process.exit(1);
}

const { fileKey, nodeId } = parseFigmaUrl(figmaUrl);
const outputRoot = cli.flags.output
    ? resolve(cli.flags.output)
    : resolve(REPO_ROOT, 'apps/website/public/composites');

const result = await extract({
    fileKey,
    nodeId,
    outputRoot,
    slugOverride: cli.flags.slug,
    label: cli.flags.label,
    skip: cli.flags.skip
        ?.split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    clean: cli.flags.clean,
    token,
});

console.log(`✓ Extracted ${result.slug} → ${result.outputDir}`);
console.log(`  warnings: ${result.warnings.length}, errors: 0`);
for (const w of result.warnings) console.log(`  ⚠ ${w}`);
