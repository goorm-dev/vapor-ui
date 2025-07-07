import type { StyleRule } from '@vanilla-extract/css';
import { style } from '@vanilla-extract/css';

import { layers } from '../layers.css';

export const layerStyle = (
    layer: keyof typeof layers, // 'theme' | 'reset' ...
    rule: StyleRule,
    debugId?: string,
) =>
    style(
        {
            '@layer': {
                [layers[layer]]: rule,
            },
        },
        debugId,
    );
