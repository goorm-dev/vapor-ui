import { createTheme } from '@vanilla-extract/css';

import { layers } from './layers.css';
import {
    BORDER_RADIUS,
    DARK_BASIC_COLORS,
    DARK_SEMANTIC_COLORS,
    DIMENSION,
    FONT_FAMILY,
    FONT_SIZE,
    FONT_WEIGHT,
    LETTER_SPACING,
    LIGHT_BASIC_COLORS,
    LIGHT_SEMANTIC_COLORS,
    LINE_HEIGHT,
    SPACE,
} from './tokens';
import { vars } from './vars.css';

const THEME_TOKENS = {
    color: {
        ...LIGHT_BASIC_COLORS,
        ...LIGHT_SEMANTIC_COLORS,
    },
    size: {
        borderRadius: BORDER_RADIUS,
        dimension: DIMENSION,
        space: SPACE,
    },
    typography: {
        fontSize: FONT_SIZE,
        lineHeight: LINE_HEIGHT,
        letterSpacing: LETTER_SPACING,
        fontFamily: FONT_FAMILY,
        fontWeight: FONT_WEIGHT,
    },
};

const DARK_THEME_COLOR_TOKENS = {
    ...DARK_BASIC_COLORS,
    ...DARK_SEMANTIC_COLORS,
};

// Create scoped light theme
export const lightThemeClass = createTheme(vars, {
    '@layer': layers.theme,
    ...THEME_TOKENS,
});

// Create scoped dark theme (override colors, but include size and typography for proper inheritance)
export const darkThemeClass = createTheme(vars, {
    '@layer': layers.theme,
    color: DARK_THEME_COLOR_TOKENS,
    size: {
        borderRadius: BORDER_RADIUS,
        dimension: DIMENSION,
        space: SPACE,
    },
    typography: {
        fontSize: FONT_SIZE,
        lineHeight: LINE_HEIGHT,
        letterSpacing: LETTER_SPACING,
        fontFamily: FONT_FAMILY,
        fontWeight: FONT_WEIGHT,
    },
});
