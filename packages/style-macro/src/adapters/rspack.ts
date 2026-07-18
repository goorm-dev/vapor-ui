import unplugin from './unplugin';
import type { VaporStyleOptions } from './unplugin';

export type { VaporStyleOptions };

/**
 * Rspack plugin for @vapor-ui/style-macro.
 *
 *     // rspack.config.js
 *     import vaporStyle from '@vapor-ui/style-macro/rspack';
 *     module.exports = { plugins: [vaporStyle()] };
 */
export default function vaporStyleRspack(opts?: VaporStyleOptions) {
    return unplugin.rspack(opts);
}
