import { globalLayer } from '@vanilla-extract/css';

export const layerName = {
    theme: 'theme',
    reset: 'reset',
    component: 'component',
    utilities: 'utilities',
} as const;

const theme = globalLayer(layerName.theme);
const reset = globalLayer(layerName.reset);
const component = globalLayer(layerName.component);
const utilities = globalLayer(layerName.utilities);

export const layers = { theme, reset, component, utilities };
