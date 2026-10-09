import unplugin from './_factory';
import type { VaporPluginOptions } from './_factory';

export type { VaporPluginOptions };

/**
 * Rolldown plugin for @vapor-ui/style-macro.
 *
 *     // rolldown.config.js
 *     import vaporStyle from '@vapor-ui/style-macro/rolldown';
 *     export default { plugins: [vaporStyle()] };
 */
export function vaporRolldownPlugin(opts?: VaporPluginOptions) {
    return unplugin.rolldown(opts);
}
