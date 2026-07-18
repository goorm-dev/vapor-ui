import unplugin from './unplugin';
import type { VaporStyleOptions } from './unplugin';

export type { VaporStyleOptions };

/**
 * Rollup plugin for @vapor-ui/style-macro.
 *
 *     // rollup.config.js
 *     import vaporStyle from '@vapor-ui/style-macro/rollup';
 *     export default { plugins: [vaporStyle()] };
 */
export default function vaporStyleRollup(opts?: VaporStyleOptions) {
    return unplugin.rollup(opts);
}
