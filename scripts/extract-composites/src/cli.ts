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

const CONTENT_ROOT = resolve(REPO_ROOT, 'apps/website/content/docs/composites/(components)');
const PUBLIC_ROOT = resolve(REPO_ROOT, 'apps/website/public/composites');
const LIVE_EXAMPLE_TICKET = 'VAPOR-261';

const cli = meow(
    `
    Usage
      $ extract-composites <figma-url> [options]

    Options
      --slug <slug>    Output slug (default: kebabCase of Figma canvas name)
      --skip <names>   Comma-separated section names to skip
      --clean          Remove existing MDX + public dir before extraction

    Output
      MDX    apps/website/content/docs/composites/(components)/<slug>.mdx
      Images apps/website/public/composites/<slug>/images/

    Env
      FIGMA_TOKEN      Required. Loaded via dotenv from repo .env.
    `,
    {
        importMeta: import.meta,
        flags: {
            slug: { type: 'string' },
            skip: { type: 'string' },
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

const result = await extract({
    fileKey,
    nodeId,
    contentFile: (slug) => resolve(CONTENT_ROOT, `${slug}.mdx`),
    publicDir: (slug) => resolve(PUBLIC_ROOT, slug),
    slugOverride: cli.flags.slug,
    skip: cli.flags.skip
        ?.split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    clean: cli.flags.clean,
    token,
    liveExampleTicket: LIVE_EXAMPLE_TICKET,
});

console.log(`✓ Extracted ${result.slug}`);
console.log(`  mdx    ${result.mdxPath}`);
console.log(`  images ${result.publicDir}/images`);
console.log(`  warnings: ${result.warnings.length}, errors: 0`);
for (const w of result.warnings) console.log(`  ⚠ ${w}`);
