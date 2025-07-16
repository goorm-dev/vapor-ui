import type { PluginCreator } from 'postcss';

interface PluginOptions {
    order?: string;
}

const DEFAULT_LAYER_ORDER =
    '@layer tw-theme, vapor-theme, vapor-reset, vapor-component, vapor-utilities, tw-utilities;';

const plugin: PluginCreator<PluginOptions> = (opts) => {
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
plugin.postcss = true;

module.exports = plugin;
