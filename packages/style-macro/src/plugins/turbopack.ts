import { basename } from 'node:path';

import { compileModule } from './_module-css';
import { type VaporPluginOptions, resolveOptions } from './_options';

/** Turbopack 쿼리. 이 쿼리가 붙은 소스 import 는 `css-loader` 규칙(`as: '*.css'`)을 탄다. */
export const VAPOR_CSS_QUERY = 'vapor-css';

export interface TurbopackLoaderContext {
    resourcePath: string;
    resourceQuery?: string;
    rootContext?: string;
    getOptions?: () => VaporPluginOptions;
}

/**
 * Turbopack JS loader. `css()` 를 class 로 바꾸고, CSS 를 만든 모듈에
 * `import './a.tsx?vapor-css'` 를 넣는다 — Next 플러그인이 같은 glob 에 이 쿼리 조건으로
 * `css-loader` + `as: '*.css'` 규칙을 등록한다.
 */
export default async function vaporStyleTurbopackLoader(
    this: TurbopackLoaderContext,
    source: string,
): Promise<string> {
    const opts = resolveOptions(this.getOptions ? this.getOptions() : {}, {
        root: this.rootContext,
    });
    const compiled = compileModule(
        source,
        this.resourcePath,
        opts,
        (_cssName, filename) => `./${basename(filename)}?${VAPOR_CSS_QUERY}`,
    );
    return compiled?.code ?? source;
}
