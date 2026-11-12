import { type CollectOptions, replaceAtRule } from './_collect';

/** webpack / Turbopack 공용 CSS loader 컨텍스트 (사용하는 멤버만). */
export interface CssLoaderContext {
    resourcePath: string;
    getOptions?: () => CollectOptions;
    addDependency(file: string): void;
    addContextDependency(dir: string): void;
}

/**
 * `@vapor-utilities;` 를 프로젝트 전체 `css()` 룰로 치환하는 CSS loader.
 * `@tailwindcss/turbopack` 과 같은 자리(`turbopack.rules['*.css']`)에서 동작한다.
 */
export default function vaporStyleCssLoader(this: CssLoaderContext, source: string): string {
    const opts = this.getOptions ? this.getOptions() : {};
    const result = replaceAtRule(source, opts);
    if (!result) return source;

    for (const file of result.files) this.addDependency(file);
    this.addContextDependency(result.root);
    return result.css;
}
