import type { Plugin } from 'vite';

export interface TailwindcssLayerOptions {
    order?: string;
}

const DEFAULT_LAYER_ORDER = '@layer tw-theme, theme, reset, component, utilities, tw-utilities;';

export const tailwindcssLayer = (options: TailwindcssLayerOptions = {}): Plugin => {
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
