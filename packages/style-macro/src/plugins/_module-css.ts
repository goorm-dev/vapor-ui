import { basename, dirname, join } from 'node:path';

import { formatBuildError } from '~/compilers/code-frame';
import { type SourceMapV3, transform } from '~/compilers/transform';

import { type ResolvedOptions, scopeOf } from './_options';

/**
 * 모듈 CSS 파일 이름 접미사. 소스 이름을 확장자째 앞에 붙이므로(`button.tsx.vapor.css`)
 * CSS 이름만으로 원본 소스를 되찾을 수 있다 — 같은 폴더의 `a.ts` / `a.tsx` 도 겹치지 않는다.
 */
export const MODULE_CSS_SUFFIX = '.vapor.css';

/** webpack 모듈 CSS 쿼리 키. 값은 root 기준 모듈 CSS 경로(`src/a.tsx.vapor.css`, URI 인코딩). */
export const VAPOR_SRC_QUERY = 'vapor-src';

/**
 * webpack 모듈 CSS 자리표시 파일. 절대 경로 대신 패키지 specifier 로 넣어 빌드 캐시·출력이
 * 설치 경로에 묶이지 않게 한다 (소스가 `@vapor-ui/style-macro` 를 import 하므로 resolve 된다).
 */
export const MODULE_CSS_PLACEHOLDER = '@vapor-ui/style-macro/module.vapor.css';

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

/**
 * 모듈 CSS 를 가리킬 import 경로. 번들러마다 다르다 — 기본은 가상 파일(`./a.tsx.vapor.css`,
 * Vite·rolldown), webpack 은 자리표시 CSS 파일 + 소스 쿼리
 * (`@vapor-ui/style-macro/module.vapor.css?vapor-src=src%2Fa.tsx.vapor.css`), Turbopack 은 쿼리(`./a.tsx?vapor-css`).
 */
export type CssImportOf = (cssName: string, filename: string) => string;

const defaultCssImport: CssImportOf = (cssName) => `./${cssName}`;

export interface CompiledModule {
    /** 변환된 JS. CSS 가 있으면 `import './<file>.vapor.css'` 가 마지막 import 뒤에 들어 있다. */
    code: string;
    /** `code` → 원본 source map. 바뀐 것이 없으면 `null`. */
    map: SourceMapV3 | null;
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
/**
 * 소스 파일을 JS 모듈이 아니라 자산으로 가져오는 쿼리 (`?raw` 텍스트, `?url` 주소). 이런 요청의
 * 모듈은 소스가 아니므로 매크로 대상이 아니다 — 컴파일하면 그 소스의 모듈 CSS 를 이 (CSS 없는)
 * 결과로 덮는다. Vite 의 `SPECIAL_QUERY_RE` 에서 소스를 JS 로 실행하는 worker 를 뺀 것이다
 * (`?inline` 은 CSS 전용이라 JS 소스에는 붙지 않는다).
 */
const ASSET_QUERY_RE = /[?&](?:raw|url)(?:&|=|$)/;

export function compileModule(
    code: string,
    id: string,
    opts: Pick<ResolvedOptions, 'include' | 'hash' | 'layer' | 'root'>,
    cssImportOf: CssImportOf = defaultCssImport,
): CompiledModule | null {
    const [filename, query = ''] = id.split('?') as [string, string?];
    if (ASSET_QUERY_RE.test(`?${query}`)) return null;
    if (!opts.include(filename) || !code.includes('@vapor-ui/style-macro')) return null;

    const cssName = moduleCssName(filename);
    const result = transform({
        source: code,
        filename,
        hash: opts.hash,
        layer: opts.layer,
        scope: scopeOf(opts.root, filename),
        cssImport: cssImportOf(cssName, filename),
    });
    if (result.errors.length) {
        throw new Error(result.errors.map((e) => formatBuildError(e, code, filename)).join('\n\n'));
    }
    return {
        code: result.code,
        map: result.map,
        css: result.css ? result.css.replace(LAYER_STATEMENT_RE, '') : null,
        cssPath: join(dirname(filename), cssName),
    };
}
