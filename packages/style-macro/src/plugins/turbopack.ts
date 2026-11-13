import { formatBuildError } from '~/compilers/code-frame';
import { transform } from '~/compilers/transform';

import { type VaporPluginOptions, resolveOptions } from './_options';

export interface TurbopackLoaderContext {
    resourcePath: string;
    resourceQuery?: string;
    rootContext?: string;
    getOptions?: () => VaporPluginOptions;
}

/** JS 변환 전용. CSS 는 `css-loader` 가 `@vapor-utilities;` 또는 `layers.css` import 자리에서 수집한다. */
export default async function vaporStyleTurbopackLoader(
    this: TurbopackLoaderContext,
    source: string,
): Promise<string> {
    const opts = resolveOptions(this.getOptions ? this.getOptions() : {}, {
        root: this.rootContext,
    });

    if (!opts.include(this.resourcePath)) return source;
    if (!source.includes('@vapor-ui/style-macro')) return source;

    const result = transform({ source, filename: this.resourcePath, hash: opts.hash });

    if (result.errors.length > 0) {
        const messages = result.errors
            .map((err) => formatBuildError(err, source, this.resourcePath))
            .join('\n\n');
        throw new Error(messages);
    }

    return result.code;
}
