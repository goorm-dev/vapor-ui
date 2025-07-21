import type { PluginCreator } from 'postcss';

import { DEFAULT_LAYER_ORDER, POSTCSS_PLUGIN_NAME } from '~/constants';

export interface PostcssLayerPluginOptions {
    order?: string;
}

export const postcssLayerPlugin: PluginCreator<PostcssLayerPluginOptions> = (opts) => {
    const options = opts && typeof opts === 'object' ? opts : {};

    const finalLayerOrder =
        typeof options.order === 'string' && options.order.length > 0
            ? options.order
            : DEFAULT_LAYER_ORDER;

    return {
        postcssPlugin: POSTCSS_PLUGIN_NAME,
        Once(root) {
            root.prepend(finalLayerOrder);
        },
    };
};

postcssLayerPlugin.postcss = true;
