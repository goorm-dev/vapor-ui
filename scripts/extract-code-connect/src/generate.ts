import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import prettier from 'prettier';

import { fromMcp } from './adapters/mcp';
import { collectComponentSetIds, fromRest } from './adapters/rest';
import type { RestComponentSetDoc, RestNodesResponse } from './adapters/rest';
import type { CliContext } from './cli/context';
import { extract } from './extract';
import { parseFigmaUrl } from './figma-url';
import type { ComponentTree } from './model';
import { toKebab, toPascal } from './naming';
import { render } from './render';

export interface GenerateOptions {
    /** node-id 를 포함한 Figma 디자인 URL */
    url: string;
    /** REST 대신 저장된 get_context_for_code_connect JSON 경로 (cwd 기준) */
    fromJson?: string;
    /** 출력 경로 (cwd 기준). 기본 `src/components/<kebab>/<kebab>.figma.ts` */
    out?: string;
    /** getProperties 를 export 하는 모듈 (cwd 기준) */
    utils: string;
    /** 기존 파일 덮어쓰기 허용 */
    force: boolean;
}

/** Figma 컴포넌트 → `.figma.ts` 파일 생성. 사용자 오류는 Error throw (호출자가 exit code 로 변환). */
export async function generate(opts: GenerateOptions, ctx: CliContext): Promise<void> {
    const { cwd, env, log, warn } = ctx;
    const { fileKey, nodeId } = parseFigmaUrl(opts.url);

    const { name, tree } = opts.fromJson
        ? fromMcp(readJson(path.resolve(cwd, opts.fromJson)))
        : await loadFromRest(fileKey, nodeId, loadToken(cwd, env));

    const componentName = toPascal(name);
    const kebab = toKebab(name);
    const componentDir = path.join(cwd, 'src/components', kebab);
    const defaultOutPath = path.join(componentDir, `${kebab}.figma.ts`);
    const outPath = opts.out ? path.resolve(cwd, opts.out) : defaultOutPath;

    if (existsSync(outPath) && !opts.force) {
        throw new Error(`Refusing to overwrite ${path.relative(cwd, outPath)} (use --force)`);
    }

    const blocks = extract(tree, { warn: (m) => warn(`warn: ${m}`) });
    if (blocks.length === 0) {
        throw new Error('No parenthesized instances found; nothing to generate');
    }

    // --out 이 소비 패키지 밖이면 utils import 는 기본 출력 위치 기준으로 계산한다.
    const importAnchor = isInside(cwd, outPath) ? outPath : defaultOutPath;
    if (importAnchor !== outPath) {
        warn(
            `warn: --out is outside ${cwd}; utils import computed as if written to ${path.relative(cwd, defaultOutPath)}`,
        );
    }

    const raw = render({
        blocks,
        url: opts.url,
        componentName,
        kebab,
        hasParts: existsSync(path.join(componentDir, 'index.parts.ts')),
        utilsImport: relativeImport(importAnchor, path.resolve(cwd, opts.utils)),
        packageImportPath: resolvePackageImportPath(cwd),
    });

    const formatted = await format(raw, outPath, cwd, warn);

    mkdirSync(path.dirname(outPath), { recursive: true });
    writeFileSync(outPath, formatted, 'utf8');
    log(`Wrote ${path.relative(cwd, outPath)} (${blocks.length} blocks)`);
}

/**
 * 출력 파일에서 유틸 모듈로 가는 import 지정자.
 * 확장자 제거, POSIX 구분자, `./`/`../` 접두 보장.
 */
export function relativeImport(fromFile: string, targetModule: string): string {
    const target = targetModule.replace(/\.[cm]?[jt]sx?$/, '');
    let rel = path.relative(path.dirname(fromFile), target).split(path.sep).join('/');
    if (!rel.startsWith('.')) rel = `./${rel}`;
    return rel;
}

/** `<cwd>/figma.config.json` 의 packageImportPath → 없으면 `<cwd>/package.json` 의 name. */
export function resolvePackageImportPath(cwd: string): string {
    const figmaConfig = path.join(cwd, 'figma.config.json');
    if (existsSync(figmaConfig)) {
        const v = readJson(figmaConfig);
        if (isRecord(v) && typeof v.packageImportPath === 'string') return v.packageImportPath;
    }
    const pkg = path.join(cwd, 'package.json');
    if (existsSync(pkg)) {
        const v = readJson(pkg);
        if (isRecord(v) && typeof v.name === 'string') return v.name;
    }
    throw new Error(
        `Cannot resolve package name: add packageImportPath to figma.config.json or name to package.json in ${cwd}`,
    );
}

/** `<cwd>/.env` 가 있으면 process.env 에 로드(기존 값 우선). FIGMA_TOKEN 없으면 에러. */
function loadToken(cwd: string, env: NodeJS.ProcessEnv): string {
    if (!env.FIGMA_TOKEN) {
        const envFile = path.join(cwd, '.env');
        if (existsSync(envFile)) {
            process.loadEnvFile(envFile);
            if (env !== process.env && process.env.FIGMA_TOKEN) {
                env.FIGMA_TOKEN = process.env.FIGMA_TOKEN;
            }
        }
    }
    const token = env.FIGMA_TOKEN;
    if (!token) throw new Error('FIGMA_TOKEN is not set (or pass --from-json)');
    return token;
}

async function loadFromRest(
    fileKey: string,
    nodeId: string,
    token: string,
): Promise<ComponentTree> {
    const getNodes = async (ids: string[], depth?: number): Promise<RestNodesResponse> => {
        const params = new URLSearchParams({ ids: ids.join(',') });
        if (depth) params.set('depth', String(depth));
        const res = await fetch(`https://api.figma.com/v1/files/${fileKey}/nodes?${params}`, {
            headers: { 'X-FIGMA-TOKEN': token },
        });
        if (!res.ok) {
            throw new Error(`Figma API ${res.status} ${res.statusText} for ids=${ids.join(',')}`);
        }
        // I/O 경계. 응답 구조는 rest.ts 의 optional 필드 타입이 방어한다.
        return (await res.json()) as RestNodesResponse;
    };

    const nodesJson = await getNodes([nodeId]);
    const setIds = collectComponentSetIds(nodesJson, nodeId);

    const setDocs: Record<string, RestComponentSetDoc> = {};
    if (setIds.length > 0) {
        const setsJson = await getNodes(setIds, 1);
        for (const id of setIds) {
            const doc = setsJson.nodes?.[id]?.document;
            if (doc) setDocs[id] = doc;
        }
    }

    return fromRest(nodesJson, nodeId, setDocs);
}

/** Prettier: 소비 패키지(cwd) 기준 설정. 플러그인 로드 실패 시 플러그인 없이 재시도. */
async function format(
    raw: string,
    outPath: string,
    cwd: string,
    warn: (m: string) => void,
): Promise<string> {
    const config = (await prettier.resolveConfig(path.join(cwd, 'package.json'))) ?? {};
    try {
        return await prettier.format(raw, { ...config, filepath: outPath });
    } catch (err) {
        warn(
            `warn: prettier plugins failed (${err instanceof Error ? err.message : String(err)}); formatting without plugins`,
        );
        return prettier.format(raw, { ...config, plugins: [], filepath: outPath });
    }
}

function readJson(file: string): unknown {
    return JSON.parse(readFileSync(file, 'utf8'));
}

function isRecord(v: unknown): v is Record<string, unknown> {
    return typeof v === 'object' && v !== null;
}

/** `child` 가 `dir` 안(또는 같음)인지. */
function isInside(dir: string, child: string): boolean {
    const rel = path.relative(dir, child);
    return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
}
