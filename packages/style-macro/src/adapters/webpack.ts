import unplugin from './unplugin';
import type { VaporStyleOptions } from './unplugin';

export type { VaporStyleOptions };

/**
 * webpack plugin for @vapor-ui/style-macro. Also usable from
 * `next.config.js` under `webpack(config) { ... }` when opting out of the
 * `next` helper.
 *
 *     // webpack.config.js
 *     import vaporStyle from '@vapor-ui/style-macro/webpack';
 *     module.exports = { plugins: [vaporStyle()] };
 */
export default function vaporStyleWebpack(opts?: VaporStyleOptions) {
    return unplugin.webpack(opts);
}
