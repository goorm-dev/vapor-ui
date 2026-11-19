import { basename } from 'node:path';

import { type LoaderContext, resolveLoaderOptions } from './_loader';
import { VAPOR_CSS_QUERY, compileModule } from './_module-css';

/**
 * Turbopack JS loader. `css()` 를 class 로 바꾸고, CSS 를 만든 모듈에
 * `import './a.tsx?vapor-css'` 를 넣는다 — Next 플러그인이 같은 glob 에 이 쿼리 조건으로
 * `css-loader` + `as: '*.css'` 규칙을 등록한다.
 */
export default async function vaporStyleTurbopackLoader(
    this: LoaderContext,
    source: string,
): Promise<string | undefined> {
    const opts = resolveLoaderOptions(this);
    const compiled = compileModule(
        source,
        this.resourcePath,
        opts,
        (_cssName, filename) => `./${basename(filename)}?${VAPOR_CSS_QUERY}`,
    );
    if (compiled && compiled.code !== source && this.callback) {
        this.callback(null, compiled.code, compiled.map);
        return undefined;
    }
    return compiled?.code ?? source;
}
