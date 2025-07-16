import type { Plugin } from 'vite';

export interface VaporTailwindPluginOptions {
    layerOrder?: string;
}

const DEFAULT_LAYER_ORDER =
    '@layer tw-theme, theme, tw-base, reset, component, utilities, tw-utilities;';

export function vaporTailwindPlugin(options: VaporTailwindPluginOptions = {}): Plugin {
    const { layerOrder = DEFAULT_LAYER_ORDER } = options;

    return {
        name: 'vapor-tailwind-plugin',

        transformIndexHtml(html) {
            return {
                html,
                tags: [
                    {
                        tag: 'style',
                        children: layerOrder,
                        injectTo: 'head-prepend',
                    },
                ],
            };
        },
    };
}

export default vaporTailwindPlugin;
