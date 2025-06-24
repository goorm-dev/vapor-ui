import type { StyleRule } from '@vanilla-extract/css';
import { globalLayer, style } from '@vanilla-extract/css';

const reset = globalLayer('reset');
const theme = globalLayer('theme');
const component = globalLayer('component');
const utilities = globalLayer('utilities');

const layerMap = { reset, theme, component, utilities };

export const layerStyle = (
    layer: 'reset' | 'theme' | 'component' | 'utilities',
    rule: StyleRule,
    debugId?: string,
) =>
    style(
        {
            '@layer': {
                [layerMap[layer]]: rule,
            },
        },
        debugId,
    );

export const layers = { reset, theme, component, utilities };
