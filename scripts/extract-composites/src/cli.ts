#!/usr/bin/env tsx
import { config as loadEnv } from 'dotenv';
import meow from 'meow';
import { execFileSync, execSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';

import { extract } from './extractor.ts';
import { SECTION_WHITELIST, type SectionTitle } from './types.ts';
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

const DOCS_ROOT = resolve(REPO_ROOT, 'apps/website/content/docs');
const CONTENT_ROOT = resolve(DOCS_ROOT, 'composites/(components)');
const PUBLIC_ROOT = resolve(REPO_ROOT, 'apps/website/public/composites');

const cli = meow(
    `
    Usage
      $ extract-composites <figma-url> [options]

    Options
      --slug <slug>   Output slug (default: kebabCase of Figma canvas name)
      --only <names>  Comma-separated section whitelist (${SECTION_WHITELIST.join(', ')})
      --clean         Remove existing MDX + public dir before extraction
      --force         Overwrite existing demos/*.tsx files

    Output
      MDX   apps/website/content/docs/composites/(components)/<slug>/index.mdx
      TSX   apps/website/content/docs/composites/(components)/<slug>/demos/<section>-<idx>.tsx
      Img   apps/website/public/composites/<slug>/images/<section>-<idx>.webp

    Env
      FIGMA_TOKEN     Required. Loaded via dotenv from repo .env.
    `,
    {
        importMeta: import.meta,
        flags: {
            slug: { type: 'string' },
            only: { type: 'string' },
            clean: { type: 'boolean', default: false },
            force: { type: 'boolean', default: false },
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

const only = parseOnly(cli.flags.only);

const result = await extract({
    fileKey,
    nodeId,
    contentFile: (slug) => resolve(CONTENT_ROOT, slug, 'index.mdx'),
    publicDir: (slug) => resolve(PUBLIC_ROOT, slug),
    componentDir: (slug) => resolve(CONTENT_ROOT, slug),
    docsRoot: DOCS_ROOT,
    slugOverride: cli.flags.slug,
    clean: cli.flags.clean,
    force: cli.flags.force,
    only,
    token,
});

runFormat([result.mdxPath, ...result.demoFiles]);

for (const w of result.warnings) console.log(`⚠️ ${w}`);

function runFormat(files: string[]): void {
    if (files.length === 0) return;
    console.log(`\nprettier --write ${files.length}개 파일을 포매팅합니다...`);
    try {
        execFileSync('pnpm', ['-w', 'exec', 'prettier', '--write', ...files], {
            cwd: REPO_ROOT,
            stdio: 'inherit',
        });
    } catch (err) {
        console.warn(`\n⚠️ prettier 포매팅을 완료하지 못했습니다: ${(err as Error).message}`);
        console.warn('   생성된 파일은 그대로 보존됩니다. 필요하면 수동으로 포매팅하세요.');
        process.exitCode = 1;
    }
}

function parseOnly(raw: string | undefined): SectionTitle[] | undefined {
    if (!raw) return undefined;
    const list = raw
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    const allowed = new Set<string>(SECTION_WHITELIST);
    const bad = list.filter((n) => !allowed.has(n));
    if (bad.length) {
        console.error(`--only contains unknown sections: ${bad.join(', ')}`);
        console.error(`known: ${SECTION_WHITELIST.join(', ')}`);
        process.exit(1);
    }
    return list as SectionTitle[];
}
