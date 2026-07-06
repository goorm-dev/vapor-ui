import { emitLayerOrderCss, resolveOptions } from '~/bundler/plugin-shared';
import type { VaporStyleOptions } from '~/bundler/unplugin-types';
import { formatBuildError } from '~/compiler/code-frame';
import { transform } from '~/compiler/transform';

/**
 * Turbopack passes a subset of the webpack loader-context to `.rules` loaders.
 * These are the fields we actually consume — narrow deliberately so we don't
 * accidentally depend on webpack-only extensions.
 */
export interface TurbopackLoaderContext {
    resourcePath: string;
    resourceQuery?: string;
    getOptions?: () => VaporStyleOptions;
}

/**
 * Build an inline `data:text/css` import statement carrying the given CSS
 * payload. Turbopack routes `data:text/css` URIs through its native CSS
 * pipeline, so we don't need a placeholder file on disk or a re-entry rule.
 */
function dataCssImport(css: string): string {
    return `import "data:text/css,${encodeURIComponent(css)}";`;
}

/**
 * Turbopack loader entrypoint.
 *
 * Transforms `$style` calls in the source and prepends `data:text/css` imports
 * for any CSS the transform emits (per-file rules, plus a `@layer` order
 * declaration when a `<ThemeProvider layer>` is seen).
 *
 * Source files with no `$style` occurrence are returned unmodified as a fast
 * path — the loader runs on every matched file in the project, so this early
 * exit is load-bearing.
 */
export default async function vaporStyleTurbopackLoader(
    this: TurbopackLoaderContext,
    source: string,
): Promise<string> {
    const rawOpts = this.getOptions ? this.getOptions() : ({} as VaporStyleOptions);
    const opts = resolveOptions(rawOpts);

    // Fast-path: no `$style` (or user-configured importName) in source → nothing to do.
    if (!source.includes(opts.importName)) return source;

    const result = transform({
        source,
        filename: this.resourcePath,
        manifest: opts.manifest,
        importSource: opts.importSource,
        importName: opts.importName,
        obfuscate: opts.obfuscate,
        providerImportSource: opts.providerImportSource,
        providerImportName: opts.providerImportName,
        layerRegistry: opts.layerRegistry,
    });

    if (result.errors.length > 0) {
        const messages = result.errors
            .map((err) => formatBuildError(err, source, this.resourcePath))
            .join('\n\n');
        throw new Error(messages);
    }

    const prepended: string[] = [];

    if (result.layerOrder) {
        prepended.push(dataCssImport(emitLayerOrderCss(result.layerOrder)));
    }

    if (result.css) {
        if (opts.themeStylesImport) {
            prepended.push(`import "${opts.themeStylesImport}";`);
        }
        prepended.push(dataCssImport(result.css));
    }

    if (prepended.length === 0) return result.code;

    return `${prepended.join('\n')}\n${result.code}`;
}
