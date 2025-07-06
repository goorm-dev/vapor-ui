import type { StyleRule } from '@vanilla-extract/css';
import { style } from '@vanilla-extract/css';

import { layers } from './layers.css';

export const layerStyle = (
    layer: 'theme' | 'reset' | 'component' | 'utilities',
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
