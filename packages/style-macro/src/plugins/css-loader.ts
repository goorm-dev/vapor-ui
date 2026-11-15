import { readFileSync } from 'node:fs';
import { isAbsolute, relative, resolve } from 'node:path';

import { VAPOR_SRC_QUERY, compileModule, isModuleCss, sourceOfModuleCss } from './_module-css';
import { type VaporPluginOptions, resolveOptions } from './_options';

/** webpack / Turbopack 공용 loader 컨텍스트 (사용하는 멤버만). */
export interface CssLoaderContext {
    resourcePath: string;
    resourceQuery?: string;
    rootContext?: string;
    getOptions?: () => VaporPluginOptions;
    addDependency?(file: string): void;
}

/**
 * 원본 소스 모듈을 받아 그 모듈의 CSS 를 돌려주는 loader. JS 쪽 변환이 넣은 import 가
 * 이 loader 를 거쳐 CSS 모듈이 된다.
 * - webpack: `import '@vapor-ui/style-macro/module.vapor.css?vapor-src=src%2Fa.tsx.vapor.css'` — 자리표시 파일 대신
 *   쿼리가 가리키는 소스(root 기준)를 읽는다. `enforce: 'pre'` 규칙이라 앱의 CSS loader 보다
 *   먼저 실행된다.
 * - Turbopack: `import './a.tsx?vapor-css'` — 쿼리 조건 규칙 + `as: '*.css'`.
 *
 * JS 변환과 같은 옵션·해시로 컴파일하므로 class 이름이 일치한다. 규칙이 없으면 빈 시트.
 */
export default function vaporCssLoader(this: CssLoaderContext, source: string): string {
    const opts = resolveOptions(this.getOptions ? this.getOptions() : {}, {
        root: this.rootContext,
    });
    const src = new URLSearchParams(this.resourceQuery?.slice(1) ?? '').get(VAPOR_SRC_QUERY);
    if (src === null) return compileModule(source, this.resourcePath, opts)?.css ?? '';

    const file = resolve(opts.root, sourceOfModuleCss(src));
    const rel = relative(opts.root, file);
    if (!isModuleCss(src) || isAbsolute(src) || rel.startsWith('..') || isAbsolute(rel)) {
        throw new Error(
            `[@vapor-ui/style-macro] Invalid ?${VAPOR_SRC_QUERY}=${src}: expected a module CSS path inside ${opts.root}.`,
        );
    }
    this.addDependency?.(file);
    return compileModule(readFileSync(file, 'utf8'), file, opts)?.css ?? '';
}
