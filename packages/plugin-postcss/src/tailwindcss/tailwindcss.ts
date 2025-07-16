import type { PluginCreator } from 'postcss';

interface TailwindcssLayerOptions {
    order?: string;
}

const DEFAULT_LAYER_ORDER =
    '@layer tw-theme, theme, reset, component, utilities, tw-utilities;';

export const tailwindcssLayer: PluginCreator<TailwindcssLayerOptions> = (opts) => {
    const options = opts && typeof opts === 'object' ? opts : {};

    const finalLayerOrder =
        typeof options.order === 'string' && options.order.length > 0
            ? options.order
            : DEFAULT_LAYER_ORDER;

    return {
        postcssPlugin: '@vapor-ui/plugin-postcss',
        Once(root) {
            root.prepend(finalLayerOrder);
        },
    };
};

tailwindcssLayer.postcss = true;
