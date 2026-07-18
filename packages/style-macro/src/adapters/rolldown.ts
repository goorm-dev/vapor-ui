import unplugin from './unplugin';
import type { VaporStyleOptions } from './unplugin';

export type { VaporStyleOptions };

/**
 * Rolldown plugin for @vapor-ui/style-macro.
 *
 *     // rolldown.config.js
 *     import vaporStyle from '@vapor-ui/style-macro/rolldown';
 *     export default { plugins: [vaporStyle()] };
 */
export default function vaporStyleRolldown(opts?: VaporStyleOptions) {
    return unplugin.rolldown(opts);
}
