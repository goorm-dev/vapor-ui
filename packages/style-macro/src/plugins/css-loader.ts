import { readFileSync } from 'node:fs';
import { isAbsolute, resolve } from 'node:path';

import { type LoaderContext, resolveLoaderOptions } from './_loader';
import { VAPOR_SRC_QUERY, compileModule, isModuleCss, sourceOfModuleCss } from './_module-css';

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
export default function vaporCssLoader(this: LoaderContext, source: string): string {
    const opts = resolveLoaderOptions(this);
    const src = new URLSearchParams(this.resourceQuery?.slice(1) ?? '').get(VAPOR_SRC_QUERY);
    if (src === null) return compileModule(source, this.resourcePath, opts)?.css ?? '';

    // 신뢰 경계는 JS 변환과 같은 `include` 필터다. JS 쪽이 이 import 를 넣은 파일이면 root 밖
    // (모노레포 형제 패키지)이어도 읽고, 아니면 파일을 열기 전에 거부한다.
    const file =
        isModuleCss(src) && !isAbsolute(src) ? resolve(opts.root, sourceOfModuleCss(src)) : null;
    if (!file || !opts.include(file)) {
        throw new Error(
            `[@vapor-ui/style-macro] Invalid ?${VAPOR_SRC_QUERY}=${src}: expected a module CSS path, relative to ${opts.root}, of a file matched by include/exclude.`,
        );
    }
    this.addDependency?.(file);
    return compileModule(readFileSync(file, 'utf8'), file, opts)?.css ?? '';
}
