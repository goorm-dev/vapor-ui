import unplugin from './_factory';
import { type VaporPluginOptions, resolveOptions } from './_options';
import { type MinimalCompiler, applyModuleCss, tapHtmlFouc } from './_webpack';

export type { VaporPluginOptions };

interface WebpackPluginShape {
    apply(compiler: unknown): void;
}

/**
 * Webpack plugin for @vapor-ui/style-macro (webpack 5).
 *
 * `css()` 를 쓰는 모듈마다 자기 CSS 를 import 한다 (`module.vapor.css?vapor-src=…`). 이 요청은
 * 앱의 `.css` 규칙(css-loader + style-loader / mini-css-extract-plugin)으로 처리되므로 앱에
 * `.css` 규칙이 있어야 한다. 레이어 순서는 앱 CSS 진입점에서 `@vapor-ui/core/layers.css` 를
 * 모든 `@vapor-ui/*` import 보다 먼저 import 해 고정한다.
 *
 *     // webpack.config.js
 *     import { vaporWebpackPlugin } from '@vapor-ui/style-macro/webpack';
 *     module.exports = { plugins: [vaporWebpackPlugin()] };
 */
export function vaporWebpackPlugin(opts: VaporPluginOptions = {}): WebpackPluginShape {
    const resolved = resolveOptions(opts);
    const base = unplugin.webpack(opts) as WebpackPluginShape;

    return {
        apply(compiler) {
            applyModuleCss(compiler as MinimalCompiler, opts);
            base.apply(compiler);
            tapHtmlFouc(compiler as MinimalCompiler, resolved.injectColorScheme);
        },
    };
}
