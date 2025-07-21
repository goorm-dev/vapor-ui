import type { Plugin } from 'vite';

import { DEFAULT_LAYER_ORDER } from '~/constants';

export interface ViteLayerPluginOptions {
    order?: string;
}

export const viteLayerPlugin = (options: ViteLayerPluginOptions = {}): Plugin => {
    const { order = DEFAULT_LAYER_ORDER } = options;

    return {
        name: '@vapor-ui/plugin-vite',

        transformIndexHtml(html) {
            return {
                html,
                tags: [
                    {
                        tag: 'style',
                        children: order,
                        injectTo: 'head-prepend',
                    },
                ],
            };
        },
    };
};
