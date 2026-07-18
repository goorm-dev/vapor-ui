import unplugin from './unplugin';
import type { VaporStyleOptions } from './unplugin';

export type { VaporStyleOptions };

/**
 * Minimal Vite-plugin descriptor. Structurally compatible with Vite's
 * `Plugin<any>` for consumption sites (`plugins: [...]`) but small enough
 * that TypeScript does not recurse deeply when comparing it against Vite's
 * `PluginOption` union — which produced TS2321 "excessive stack depth" when
 * we returned the raw unplugin generic.
 *
 * We deliberately avoid `import type { Plugin } from 'vite'` here: pulling
 * Vite's types into this file drags PostCSS types through the DTS bundler
 * (tsdown/rolldown-plugin-dts) and trips on missing PostCSS re-exports.
 */
type VitePluginLike = { name: string };

/**
 * Vite plugin for @vapor-ui/style-macro.
 *
 *     // vite.config.ts
 *     import vaporStyle from '@vapor-ui/style-macro/vite';
 *     export default { plugins: [vaporStyle()] };
 */
export default function vaporStyleVite(
    opts?: VaporStyleOptions,
): VitePluginLike | VitePluginLike[] {
    return unplugin.vite(opts) as VitePluginLike | VitePluginLike[];
}
