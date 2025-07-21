import { createTheme } from '@vanilla-extract/css';

import { layers } from './layers.css';
import {
    DARK_BASIC_COLORS,
    DARK_SEMANTIC_COLORS,
    LIGHT_BASIC_COLORS,
    LIGHT_SEMANTIC_COLORS,
} from './tokens';
import { vars } from './vars.css';

// Create scoped light theme
export const lightThemeClass = createTheme(vars.color, {
    '@layer': layers.theme,
    ...LIGHT_BASIC_COLORS,
    ...LIGHT_SEMANTIC_COLORS,
});

// Create scoped dark theme
export const darkThemeClass = createTheme(vars.color, {
    '@layer': layers.theme,
    ...DARK_BASIC_COLORS,
    ...DARK_SEMANTIC_COLORS,
});
