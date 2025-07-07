import { createGlobalTheme } from '@vanilla-extract/css';

import { DARK_CLASS_NAME, DARK_THEME_TOKENS, THEME_TOKENS } from './constants';
import { vars } from './contract.css';
import { layers } from './layers.css';

createGlobalTheme(':root', vars, { '@layer': layers.theme, ...THEME_TOKENS });

createGlobalTheme(`:root.${DARK_CLASS_NAME}`, vars.color, {
    '@layer': layers.theme,
    ...DARK_THEME_TOKENS,
});
