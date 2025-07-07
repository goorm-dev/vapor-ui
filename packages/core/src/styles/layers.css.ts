import { globalLayer } from '@vanilla-extract/css';

const theme = globalLayer('vapor-theme');
const reset = globalLayer('vapor-reset');
const component = globalLayer('vapor-component');
const utilities = globalLayer('vapor-utilities');

export const layers = { theme, reset, component, utilities };