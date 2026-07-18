import unplugin from './unplugin';
import type { VaporStyleOptions } from './unplugin';

export type { VaporStyleOptions };

/**
 * Farm plugin for @vapor-ui/style-macro.
 *
 *     // farm.config.js
 *     import vaporStyle from '@vapor-ui/style-macro/farm';
 *     export default { plugins: [vaporStyle()] };
 */
export default function vaporStyleFarm(opts?: VaporStyleOptions) {
    return unplugin.farm(opts);
}
