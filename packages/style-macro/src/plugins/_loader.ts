import { type ResolvedOptions, type VaporPluginOptions, resolveOptions } from './_options';

/** webpack / Turbopack loader 컨텍스트 (사용하는 멤버만). */
export interface LoaderContext {
    resourcePath: string;
    resourceQuery?: string;
    rootContext?: string;
    getOptions?: () => VaporPluginOptions;
    addDependency?(file: string): void;
    /** webpack loader 규약 — 있으면 source map 을 함께 넘긴다. */
    callback?: (err: Error | null, code?: string, map?: unknown) => void;
}

/** loader 옵션 해석. `root` 기본값은 번들러가 주는 `rootContext` 그대로다. */
export function resolveLoaderOptions(ctx: LoaderContext): ResolvedOptions {
    return resolveOptions(ctx.getOptions ? ctx.getOptions() : {}, { root: ctx.rootContext });
}
