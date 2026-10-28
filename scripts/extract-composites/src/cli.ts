#!/usr/bin/env tsx
import { config as loadEnv } from 'dotenv';
import meow from 'meow';
import { execFileSync, execSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';

import { FigmaClient } from './clients/figma.ts';
import { SECTION_WHITELIST, type SectionTitle } from './shared/types.ts';
import { parseFigmaUrl } from './shared/url.ts';
import { analyze } from './tools/analyzer/index.ts';
import { extract } from './tools/extractor/index.ts';
import { normalize } from './tools/normalizer/index.ts';
import { render } from './tools/renderer/index.ts';

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
const onlySet = only ? new Set<SectionTitle>(only) : undefined;

console.log(`문서 추출을 시작합니다. ${cli.flags.clean ? '(clean mode)' : ''}\n`);

const client = new FigmaClient(token);
const canvas = await client.getNode(fileKey, nodeId);
const warnings: string[] = [];

const analyzed = analyze(canvas, {
    only: onlySet,
    slugOverride: cli.flags.slug,
    warnings,
});

const contentFile = resolve(CONTENT_ROOT, analyzed.slug, 'index.mdx');
const publicDir = resolve(PUBLIC_ROOT, analyzed.slug);
const componentDir = resolve(CONTENT_ROOT, analyzed.slug);

console.log(`발견된 섹션: ${analyzed.sections.length}개`);
console.log(analyzed.sections.map((s) => `- ${s.title}\n`).join(''));
console.log('내용을 분석하고 있습니다...\n');

const extracted = await extract(analyzed, {
    client,
    fileKey,
    publicDir,
    componentDir,
    docsRoot: DOCS_ROOT,
    force: cli.flags.force,
    clean: cli.flags.clean,
    warnings,
});
const normalized = normalize(extracted);

console.log(`총 ${normalized.sections.length}개의 프레임을 마크다운으로 변환합니다...\n`);

const rendered = await render(normalized, { contentFile, clean: cli.flags.clean });

console.log(`컴포넌트 문서가 작성되었습니다!`);
console.log(contentFile + '\n');

runFormat([rendered.mdxPath, ...extracted.demoFiles]);

for (const w of warnings) console.log(`⚠️ ${w}`);

function runFormat(files: string[]): void {
    if (files.length === 0) return;
    console.log(`\nprettier --write ${files.length}개 파일을 포매팅합니다...`);
    try {
        // Node's execFile cannot launch a `.cmd` shim directly, so point at
        // the Windows pnpm entrypoint when running there.
        const pnpmCmd = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
        execFileSync(pnpmCmd, ['-w', 'exec', 'prettier', '--write', ...files], {
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
