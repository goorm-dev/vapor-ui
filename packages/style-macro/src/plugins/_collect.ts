import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import picomatch from 'picomatch';

import { emitCss } from '~/compilers/emit-css';
import { transform } from '~/compilers/transform';
import type { IRRule } from '~/models/types';

import { type VaporPluginOptions, resolveOptions } from './_options';

export const VAPOR_AT_RULE = 'vapor-utilities';
export const VAPOR_AT_RULE_RE = /@vapor-utilities\s*;/g;

export type CollectOptions = VaporPluginOptions;

export interface CollectResult {
    css: string;
    files: string[];
    root: string;
}

/** 빌드 종료 시 `@vapor-utilities;` 누락 경고를 위해 치환 횟수를 기록한다. */
export const collectState = { replaced: 0 };

export function warnIfNeverReplaced(opts: CollectOptions, log: (msg: string) => void): void {
    if (collectState.replaced > 0) return;
    if (collectCss(opts).files.length === 0) return;
    log(
        '[@vapor-ui/style-macro] css() is used but no stylesheet contains `@vapor-utilities;`. ' +
            'Add it to the CSS entry that imports @vapor-ui/core/styles.css — otherwise no styles are emitted.',
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
export function collectCss(rawOpts: CollectOptions = {}): CollectResult {
    const opts = resolveOptions(rawOpts);
    const { root } = opts;

    const candidates: string[] = [];
    listSources(root, SKIP_DIRS, candidates);
    // include glob 이 기본 제외 디렉터리(node_modules 등) 를 가리키면 그 base 도 순회한다.
    for (const glob of opts.includeGlobs) {
        const base = resolve(root, picomatch.scan(glob).base);
        if (base !== root) listSources(base, new Set(['.git']), candidates);
    }

    const seen = new Set<string>();
    const rules: IRRule[] = [];
    const files: string[] = [];
    for (const file of candidates.sort()) {
        if (seen.has(file) || !opts.include(file)) continue;
        seen.add(file);
        const source = readFileSync(file, 'utf8');
        if (!source.includes('@vapor-ui/style-macro')) continue;
        files.push(file);
        const res = transform({ source, filename: file, hash: opts.hash });
        if (res.errors.length) continue;
        rules.push(...res.rules);
    }

    const css = rules.length ? emitCss(rules, opts.hash ? 'hashed' : 'readable').cssText : '';
    return { css: `/* vapor-collect: ${files.length} files */\n${css}`, files, root };
}

/** CSS 텍스트의 `@vapor-utilities;` 를 전부 치환. 치환이 없으면 `null`. */
export function replaceAtRule(source: string, opts: CollectOptions): CollectResult | null {
    if (!VAPOR_AT_RULE_RE.test(source)) return null;
    VAPOR_AT_RULE_RE.lastIndex = 0;
    const result = collectCss(opts);
    collectState.replaced++;
    return { ...result, css: source.replace(VAPOR_AT_RULE_RE, () => result.css) };
}
