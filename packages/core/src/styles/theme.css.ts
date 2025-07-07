import { createGlobalTheme } from '@vanilla-extract/css';

import { DARK_CLASS_NAME, themeTokens, vars } from './contract.css';
import { layers } from './layers.css';
import { DARK_BASIC_COLORS, DARK_SEMANTIC_COLORS } from './tokens';

createGlobalTheme(':root', vars, { '@layer': layers.theme, ...themeTokens });

createGlobalTheme(`:root.${DARK_CLASS_NAME}`, vars.color, {
    '@layer': layers.theme,
    ...DARK_BASIC_COLORS,
    ...DARK_SEMANTIC_COLORS,
});
