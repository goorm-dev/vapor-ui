import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import picomatch from 'picomatch';
import postcss, { type AtRule, type Root } from 'postcss';

import { emitCss } from '~/compilers/emit-css';
import { transform } from '~/compilers/transform';
import type { IRRule } from '~/models/types';

import {
    type ResolveDefaults,
    type ResolvedOptions,
    type VaporPluginOptions,
    resolveOptions,
} from './_options';

export const VAPOR_AT_RULE = 'vapor-utilities';
/**
 * 마커가 없을 때의 삽입 트리거인 `@import` 대상. 번들러가 `@import` 된 파일을 플러그인에
 * 넘기지 않으므로(Vite `vite:css`, Next node_modules CSS) import 하는 쪽 파일에서 처리한다.
 */
const CORE_LAYERS_SPECIFIER = '@vapor-ui/core/layers.css';

export type CollectOptions = VaporPluginOptions;

export interface CollectResult {
    css: string;
    files: string[];
    root: string;
}

/** 빌드 종료 시 삽입 지점 누락 경고를 위해 치환 횟수를 기록한다. */
export const collectState = { replaced: 0 };

export function warnIfNeverReplaced(
    opts: CollectOptions,
    log: (msg: string) => void,
    defaults?: ResolveDefaults,
): void {
    if (collectState.replaced > 0) return;
    if (collectCss(opts, defaults).files.length === 0) return;
    log(
        '[@vapor-ui/style-macro] css() is used but no stylesheet imports @vapor-ui/core/layers.css ' +
            'or contains `@vapor-utilities;`. Add one of them to your CSS entry — otherwise no styles are emitted.',
    );
}

const SOURCE_EXT = /\.(?:[cm]?[jt]sx?)$/;
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', '.next', '.turbo', 'build', 'out']);

function listSources(dir: string, skip: Set<string>, out: string[]): void {
    let entries: string[];
    try {
        entries = readdirSync(dir);
    } catch {
        return;
    }
    for (const name of entries) {
        if (skip.has(name) || name.startsWith('.')) continue;
        const full = join(dir, name);
        let st;
        try {
            st = statSync(full);
        } catch {
            continue;
        }
        if (st.isDirectory()) listSources(full, skip, out);
        else if (SOURCE_EXT.test(name)) out.push(full);
    }
}

/**
 * 프로젝트의 모든 `css()` 룰을 모아 **한 번의** `emitCss` 로 단일 시트를 만든다.
 * loader 와 같은 transform·같은 해시를 쓰므로 class 이름이 JS 쪽과 일치하고,
 * 전체 룰을 한꺼번에 정렬하므로 파일(청크) 순서가 cascade 에 영향을 주지 않는다.
 *
 * TODO(perf): 매 호출마다 전 파일을 읽고 파싱한다. loader 와 합치면 파일당 oxc 파싱
 * 2회. 파일당 ms 미만이라 보류. 체감되면 Tailwind oxide `Scanner.mtimes` 패턴으로:
 * `Map<path, { mtime, size, hash, rules }>` 를 모듈 수준에 두고 `statSync` 만 한 뒤
 * mtime·size 가 같으면 `rules` 재사용, 변경/신규 파일만 재파싱, 사라진 파일은 제거.
 */
export function collectCss(
    rawOpts: CollectOptions = {},
    defaults: ResolveDefaults = {},
): CollectResult {
    const opts = resolveOptions(rawOpts, defaults);
    const { root } = opts;

    const candidates: string[] = [];
    listSources(root, SKIP_DIRS, candidates);
    // include glob 이 root 밖이거나 기본 제외 디렉터리(node_modules 등) 를 가리키면 그 base 도 순회.
    for (const glob of opts.includeGlobs) {
        const base = picomatch.scan(glob).base;
        if (base && base !== root) listSources(base, new Set(['.git']), candidates);
    }

    return { ...buildSheet(candidates, opts), root };
}

/**
 * 주어진 파일들의 `css()` 룰을 모아 단일 정렬 시트를 만든다. `include` 를 통과하고
 * `@vapor-ui/style-macro` 를 import 하는 파일만 쓴다. 경로 정렬 후 처리하므로 입력 순서와
 * 무관하게 결과가 결정적이다. 프로젝트 스캔(`collectCss`)과 라이브러리 빌드
 * (rolldown `cssFileName`)가 같은 경로를 쓴다.
 */
export function buildSheet(
    candidates: string[],
    opts: Pick<ResolvedOptions, 'include' | 'hash'>,
): { css: string; files: string[] } {
    const rules: IRRule[] = [];
    const files: string[] = [];
    for (const file of [...new Set(candidates)].sort()) {
        if (!opts.include(file)) continue;
        const source = readFileSync(file, 'utf8');
        if (!source.includes('@vapor-ui/style-macro')) continue;
        files.push(file);
        const res = transform({ source, filename: file, hash: opts.hash });
        if (res.errors.length) continue;
        rules.push(...res.rules);
    }

    const css = rules.length ? emitCss(rules, opts.hash ? 'hashed' : 'readable').cssText : '';
    return { css: `/* vapor-collect: ${files.length} files */\n${css}`, files };
}

/** `@import` params 의 첫 토큰(문자열 또는 `url(...)`)에서 대상 경로를 꺼낸다. */
function importTarget(params: string): string | null {
    const m = /^\s*(?:url\(\s*(["']?)([^"')]*)\1\s*\)|(["'])(.*?)\3)/.exec(params);
    if (!m) return null;
    return m[2] ?? m[4] ?? null;
}

/** 이 CSS AST 에 시트를 넣을 자리. 주석·문자열은 노드가 아니므로 오탐하지 않는다. */
function findInsertionPoint(root: Root): { markers: AtRule[]; importsLayers: boolean } {
    const markers: AtRule[] = [];
    let importsLayers = false;
    root.walkAtRules((at) => {
        if (at.name === VAPOR_AT_RULE) markers.push(at);
        else if (at.name === 'import' && importTarget(at.params) === CORE_LAYERS_SPECIFIER) {
            importsLayers = true;
        }
    });
    return { markers, importsLayers };
}

/**
 * CSS AST 에 수집 결과를 삽입한다. 모든 어댑터(PostCSS·Vite·webpack/Turbopack css-loader)가
 * 이 함수를 공유한다. 우선순위:
 *  1. 사용자가 적은 `@vapor-utilities;` 노드가 있으면 그 자리(들)를 치환
 *  2. 없고 `@import '@vapor-ui/core/layers.css'` 노드가 있으면 root 끝에 append
 *     (레이어 순서는 선언문이 이미 고정하므로 블록 위치는 cascade 에 영향 없음)
 *  3. 둘 다 없으면 `null` — 수집도 하지 않는다
 *
 * 노드 단위로 넣으므로 직렬화 시 노드 사이 `;` 가 보장된다 — 마지막 문장이 `;` 없이 끝난
 * 파일(EOF 에서는 유효)에 붙여도 그 문장의 prelude 로 흡수되지 않는다.
 * `parse` 는 `root` 를 만든 postcss 인스턴스의 것을 넘긴다 (PostCSS 어댑터는 호스트 인스턴스).
 */
export function insertSheet(
    root: Root,
    parse: (css: string) => Root,
    opts: CollectOptions,
    defaults: ResolveDefaults = {},
): CollectResult | null {
    const { markers, importsLayers } = findInsertionPoint(root);
    if (!markers.length && !importsLayers) return null;

    const result = collectCss(opts, defaults);
    collectState.replaced++;
    if (markers.length) {
        for (const at of markers) at.replaceWith(parse(`\n${result.css}\n`).nodes);
    } else {
        root.append(parse(`\n${result.css}\n`).nodes);
    }
    return result;
}

/** 트리거 문자열이 아예 없으면 파싱을 건너뛴다. */
function mayHaveInsertionPoint(source: string): boolean {
    return source.includes(`@${VAPOR_AT_RULE}`) || source.includes(CORE_LAYERS_SPECIFIER);
}

/**
 * CSS 텍스트 버전 (Vite·css-loader). 파싱 → `insertSheet` → 직렬화. 삽입 지점 밖의 노드는
 * postcss 가 원본 raws(공백·주석)를 보존하므로 그대로 남는다. 파싱할 수 없는 CSS 는 `null`
 * 을 돌려 번들러가 원래 문법 오류를 보고하게 둔다.
 */
export function injectCss(
    source: string,
    opts: CollectOptions,
    defaults: ResolveDefaults = {},
): CollectResult | null {
    if (!mayHaveInsertionPoint(source)) return null;

    let root: Root;
    try {
        root = postcss.parse(source);
    } catch {
        return null;
    }
    const result = insertSheet(root, postcss.parse, opts, defaults);
    return result ? { ...result, css: root.toString() } : null;
}
