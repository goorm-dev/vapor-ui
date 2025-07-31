import { globalLayer } from '@vanilla-extract/css';

export const layerName = {
    theme: 'theme',
    reset: 'reset',
    components: 'components',
    utilities: 'utilities',
} as const;

const theme = globalLayer(layerName.theme);
const reset = globalLayer(layerName.reset);
const components = globalLayer(layerName.components);
const utilities = globalLayer(layerName.utilities);

export const layers = { theme, reset, components, utilities };
