import unplugin from './_factory';
import type { VaporPluginOptions } from './_factory';

export type { VaporPluginOptions };

type VaporVitePluginOptions = { name: string };

/**
 * Vite plugin for @vapor-ui/style-macro.
 *
 *     // vite.config.ts
 *     import vaporStyle from '@vapor-ui/style-macro/vite';
 *     export default { plugins: [vaporStyle()] };
 */
export function vaporVitePlugin(
    opts?: VaporPluginOptions,
): VaporVitePluginOptions | VaporVitePluginOptions[] {
    return unplugin.vite(opts);
}
