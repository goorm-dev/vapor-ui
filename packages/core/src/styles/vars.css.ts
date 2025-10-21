import { createGlobalTheme, createGlobalThemeContract } from '@vanilla-extract/css';

import { layers } from './layers.css';
import {
    BORDER_RADIUS,
    BOX_SHADOW,
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

const THEME_TOKENS = {
    color: { ...LIGHT_BASIC_COLORS, ...LIGHT_SEMANTIC_COLORS },
    shadow: BOX_SHADOW,
    size: { borderRadius: BORDER_RADIUS, dimension: DIMENSION, space: SPACE },
    typography: {
        fontSize: FONT_SIZE,
        lineHeight: LINE_HEIGHT,
        letterSpacing: LETTER_SPACING,
        fontFamily: FONT_FAMILY,
        fontWeight: FONT_WEIGHT,
    },
};

export const vars = createGlobalThemeContract(THEME_TOKENS, (_, path) => `vapor-${path.join('-')}`);

createGlobalTheme(`:root, [data-vapor-theme='light']`, vars, {
    '@layer': layers.theme,
    ...THEME_TOKENS,
});

const DARK_THEME_TOKENS = {
    ...DARK_BASIC_COLORS,
    ...DARK_SEMANTIC_COLORS,
};

createGlobalTheme(`[data-vapor-theme='dark']`, vars.color, {
    '@layer': layers.theme,
    ...DARK_THEME_TOKENS,
});
