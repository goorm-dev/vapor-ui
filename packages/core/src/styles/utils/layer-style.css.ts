import type { StyleRule } from '@vanilla-extract/css';
import { style } from '@vanilla-extract/css';

import type { layerName } from '../layers.css';

export const layerStyle = (
    layer: (typeof layerName)[keyof typeof layerName], // 'vapor-theme' | 'vapor-reset' ...
    rule: StyleRule,
    debugId?: string,
) =>
    style(
        {
            '@layer': {
                [layer]: rule,
            },
        },
        debugId,
    );
