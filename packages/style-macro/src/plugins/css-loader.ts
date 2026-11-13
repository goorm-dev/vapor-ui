import { type CollectOptions, injectCss } from './_collect';

/** webpack / Turbopack 공용 CSS loader 컨텍스트 (사용하는 멤버만). */
export interface CssLoaderContext {
    resourcePath: string;
    rootContext?: string;
    getOptions?: () => CollectOptions;
    addDependency(file: string): void;
    addContextDependency(dir: string): void;
}

/**
 * 수집 결과를 CSS 에 삽입하는 loader. `@tailwindcss/turbopack` 과 같은 자리
 * (`turbopack.rules['*.css']`, Next webpack CSS rule 체인)에서 동작한다.
 *
 * 삽입 지점은 `@vapor-utilities;` 또는 `@import '@vapor-ui/core/layers.css'` 가 있는 파일.
 * `layers.css` 자체에는 마커가 없으므로 import 하는 쪽 파일에서 처리한다.
 */
export default function vaporStyleCssLoader(this: CssLoaderContext, source: string): string {
    const opts = this.getOptions ? this.getOptions() : {};
    const result = injectCss(source, opts, { root: this.rootContext });
    if (!result) return source;

    for (const file of result.files) this.addDependency(file);
    this.addContextDependency(result.root);
    return result.css;
}
