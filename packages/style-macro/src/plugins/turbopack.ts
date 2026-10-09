import { formatBuildError } from '~/compilers/code-frame';
import { insertAfterDirectives } from '~/compilers/directives';
import { transform } from '~/compilers/transform';

import type { VaporPluginOptions } from './_factory';
import { resolveOptions } from './_options';

export interface TurbopackLoaderContext {
    resourcePath: string;
    resourceQuery?: string;
    getOptions?: () => VaporPluginOptions;
}

/**
 * Build an inline `data:text/css` import statement carrying the given CSS
 * payload. Turbopack routes `data:text/css` URIs through its native CSS
 * pipeline, so we don't need a placeholder file on disk or a re-entry rule.
 */
function dataCssImport(css: string): string {
    return `import "data:text/css,${encodeURIComponent(css)}";`;
}

export default async function vaporStyleTurbopackLoader(
    this: TurbopackLoaderContext,
    source: string,
): Promise<string> {
    const rawOpts = this.getOptions ? this.getOptions() : ({} as VaporPluginOptions);
    const opts = resolveOptions(rawOpts);

    // Fast-path: no `@vapor-ui/style-macro` import in source → nothing to do.
    if (!source.includes('@vapor-ui/style-macro')) return source;

    const result = transform({
        source,
        filename: this.resourcePath,
        hash: opts.hash,
    });

    if (result.errors.length > 0) {
        const messages = result.errors
            .map((err) => formatBuildError(err, source, this.resourcePath))
            .join('\n\n');
        throw new Error(messages);
    }

    const prepended: string[] = [];

    if (result.css) {
        prepended.push(dataCssImport(result.css));
    }

    if (prepended.length === 0) return result.code;

    return insertAfterDirectives(result.code, prepended);
}
