import { basename, dirname, join } from 'node:path';

import { formatBuildError } from '~/compilers/code-frame';
import { transform } from '~/compilers/transform';

import { type ResolvedOptions, scopeOf } from './_options';

/**
 * 모듈 CSS 파일 이름 접미사. 소스 이름을 확장자째 앞에 붙이므로(`button.tsx.vapor.css`)
 * CSS 이름만으로 원본 소스를 되찾을 수 있다 — 같은 폴더의 `a.ts` / `a.tsx` 도 겹치지 않는다.
 */
export const MODULE_CSS_SUFFIX = '.vapor.css';

/** 모듈 CSS 앞의 레이어 순서 선언. 순서는 `@vapor-ui/core/layers.css` 한 곳에서만 정한다. */
const LAYER_STATEMENT_RE = /^@layer [^;{]+;\n/;

export function moduleCssName(filename: string): string {
    return `${basename(filename)}${MODULE_CSS_SUFFIX}`;
}

export function isModuleCss(id: string): boolean {
    return id.split('?')[0]!.endsWith(MODULE_CSS_SUFFIX);
}

/** `/x/button.tsx.vapor.css` → `/x/button.tsx`. */
export function sourceOfModuleCss(id: string): string {
    return id.split('?')[0]!.slice(0, -MODULE_CSS_SUFFIX.length);
}

export interface CompiledModule {
    /** 변환된 JS. CSS 가 있으면 `import './<file>.vapor.css'` 가 마지막 import 뒤에 들어 있다. */
    code: string;
    /** 이 모듈의 CSS (레이어 순서 선언 제외). 규칙이 없으면 `null`. */
    css: string | null;
    /** 모듈 CSS 의 절대 경로 (소스 옆). */
    cssPath: string;
}

/**
 * 한 소스 모듈의 `css()` 를 class 로 바꾸고 모듈 CSS 를 만든다. 번들러 어댑터(Vite·rolldown)가
 * 공유한다. `include` 밖이거나 매크로 import 가 없으면 `null`. 컴파일 오류는 code frame 을
 * 붙인 메시지로 throw 한다.
 */
export function compileModule(
    code: string,
    id: string,
    opts: Pick<ResolvedOptions, 'include' | 'hash' | 'layer' | 'root'>,
): CompiledModule | null {
    const filename = id.split('?')[0]!;
    if (!opts.include(filename) || !code.includes('@vapor-ui/style-macro')) return null;

    const cssName = moduleCssName(filename);
    const result = transform({
        source: code,
        filename,
        hash: opts.hash,
        layer: opts.layer,
        scope: scopeOf(opts.root, filename),
        cssImport: `./${cssName}`,
    });
    if (result.errors.length) {
        throw new Error(result.errors.map((e) => formatBuildError(e, code, filename)).join('\n\n'));
    }
    return {
        code: result.code,
        css: result.css ? result.css.replace(LAYER_STATEMENT_RE, '') : null,
        cssPath: join(dirname(filename), cssName),
    };
}
