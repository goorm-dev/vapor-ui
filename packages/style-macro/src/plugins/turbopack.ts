import { basename } from 'node:path';

import { VAPOR_CSS_QUERY, compileModule } from './_module-css';
import { type VaporPluginOptions, resolveOptions } from './_options';

export interface TurbopackLoaderContext {
    resourcePath: string;
    resourceQuery?: string;
    rootContext?: string;
    getOptions?: () => VaporPluginOptions;
    /** webpack loader 규약 — 있으면 source map 을 함께 넘긴다. */
    callback?: (err: Error | null, code?: string, map?: unknown) => void;
}

/**
 * Turbopack JS loader. `css()` 를 class 로 바꾸고, CSS 를 만든 모듈에
 * `import './a.tsx?vapor-css'` 를 넣는다 — Next 플러그인이 같은 glob 에 이 쿼리 조건으로
 * `css-loader` + `as: '*.css'` 규칙을 등록한다.
 */
export default async function vaporStyleTurbopackLoader(
    this: TurbopackLoaderContext,
    source: string,
): Promise<string | undefined> {
    const opts = resolveOptions(this.getOptions ? this.getOptions() : {}, {
        root: this.rootContext,
    });
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
