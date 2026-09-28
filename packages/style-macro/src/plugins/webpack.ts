import unplugin from './_factory';
import type { VaporPluginOptions } from './_factory';

export type { VaporPluginOptions };

/**
 * webpack plugin for @vapor-ui/style-macro. Also usable from
 * `next.config.js` under `webpack(config) { ... }` when opting out of the
 * `next` helper.
 *
 *     // webpack.config.js
 *     import vaporStyle from '@vapor-ui/style-macro/webpack';
 *     module.exports = { plugins: [vaporStyle()] };
 */
export function vaporWebpackPlugin(opts?: VaporPluginOptions) {
    return unplugin.webpack(opts);
}
