import { createRequire } from 'node:module';

import { type ColorSchemeScriptOpts, buildColorSchemeScript } from '~/helpers/fouc-script';

import { warnIfNeverReplaced } from './_collect';
import unplugin from './_factory';
import { type VaporPluginOptions, resolveOptions } from './_options';

export type { VaporPluginOptions };

interface WebpackPluginShape {
    apply(compiler: unknown): void;
}

interface MinimalCompiler {
    hooks: {
        compilation: { tap: (name: string, fn: (c: unknown) => void) => void };
        done: { tap: (name: string, fn: () => void) => void };
    };
}

interface HtmlPluginData {
    html: string;
}

type HtmlWebpackPluginShape = {
    getHooks?: (c: unknown) => {
        beforeEmit: {
            tapAsync: (
                n: string,
                fn: (d: HtmlPluginData, cb: (err: Error | null, d: HtmlPluginData) => void) => void,
            ) => void;
        };
    };
};

const TAP_NAME = 'vapor-style-macro';

function tapHtmlFouc(compiler: unknown, injectColorScheme: false | ColorSchemeScriptOpts): void {
    if (injectColorScheme === false) return;

    const scriptTag = `<script>${buildColorSchemeScript(injectColorScheme)}</script>`;
    const injectIntoHead = (html: string): string =>
        /(<head[^>]*>)/i.test(html)
            ? html.replace(/(<head[^>]*>)/i, `$1${scriptTag}`)
            : `${scriptTag}${html}`;

    const require = createRequire(import.meta.url);

    let HtmlWebpackPlugin: HtmlWebpackPluginShape | undefined;

    try {
        HtmlWebpackPlugin = require('html-webpack-plugin') as HtmlWebpackPluginShape;
    } catch {
        /* not installed */
    }

    if (!HtmlWebpackPlugin?.getHooks) return;

    const plugin = HtmlWebpackPlugin;
    (compiler as MinimalCompiler).hooks.compilation.tap(TAP_NAME, (compilation) => {
        plugin.getHooks!(compilation).beforeEmit.tapAsync(TAP_NAME, (data, cb) => {
            data.html = injectIntoHead(data.html);
            cb(null, data);
        });
    });
}

/**
 * Webpack plugin for @vapor-ui/style-macro — JS 변환 + FOUC guard.
 * CSS 는 `@vapor-ui/style-macro/css-loader` (Next 는 자동 배선) 또는
 * `@vapor-ui/style-macro/postcss` 가 `@vapor-utilities;` 자리에서 수집한다.
 *
 *     // webpack.config.js
 *     import vaporStyle from '@vapor-ui/style-macro/webpack';
 *     module.exports = { plugins: [vaporStyle()] };
 */
export function vaporWebpackPlugin(opts: VaporPluginOptions = {}): WebpackPluginShape {
    const resolved = resolveOptions(opts);
    const base = unplugin.webpack(opts) as WebpackPluginShape;

    return {
        apply(compiler) {
            base.apply(compiler);
            tapHtmlFouc(compiler, resolved.injectColorScheme);
            (compiler as MinimalCompiler).hooks.done?.tap(TAP_NAME, () => {
                warnIfNeverReplaced(opts, (m) => console.warn(m));
            });
        },
    };
}
