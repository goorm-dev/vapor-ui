import { type ColorSchemeScriptOpts, buildColorSchemeScript } from '~/helpers/fouc-script';

import unplugin from './_factory';
import type { VaporPluginOptions } from './_factory';
import { resolveOptions } from './_options';

export type { VaporPluginOptions };

interface VitePluginShape {
    name: string;
    enforce?: 'pre' | 'post';
    [k: string]: unknown;
}

function foucPlugin(injectColorScheme: ColorSchemeScriptOpts): VitePluginShape {
    const scriptTag = `<script>${buildColorSchemeScript(injectColorScheme)}</script>`;
    return {
        name: 'vapor-style-macro:fouc',
        enforce: 'pre',
        transformIndexHtml(html: string): string {
            if (/(<head[^>]*>)/i.test(html)) {
                return html.replace(/(<head[^>]*>)/i, `$1${scriptTag}`);
            }
            return `${scriptTag}${html}`;
        },
    };
}

/**
 * Vite plugin for @vapor-ui/style-macro.
 *
 *     // vite.config.ts
 *     import vaporStyle from '@vapor-ui/style-macro/vite';
 *     export default { plugins: [vaporStyle()] };
 */
export function vaporVitePlugin(opts?: VaporPluginOptions): VitePluginShape[] {
    const resolved = resolveOptions(opts ?? {});

    const base = unplugin.vite(opts);
    const basePlugins = Array.isArray(base) ? base : [base];

    if (resolved.injectColorScheme === false) return basePlugins as VitePluginShape[];

    return [...(basePlugins as VitePluginShape[]), foucPlugin(resolved.injectColorScheme)];
}
