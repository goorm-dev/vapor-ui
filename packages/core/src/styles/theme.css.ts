import { createGlobalTheme } from '@vanilla-extract/css';

import { layers } from './layers.css';
import {
    BORDER_RADIUS,
    DARK_BASIC_COLORS,
    DARK_BOX_SHADOW,
    DARK_SEMANTIC_COLORS,
    DIMENSION,
    FONT_FAMILY,
    FONT_SIZE,
    FONT_WEIGHT,
    LETTER_SPACING,
    LIGHT_BASIC_COLORS,
    LIGHT_BOX_SHADOW,
    LIGHT_SEMANTIC_COLORS,
    LINE_HEIGHT,
    SPACE,
} from './tokens';
import { vars } from './vars.css';

const DARK_CLASS_NAME = 'vapor-dark-theme';

const THEME_TOKENS = {
    color: {
        ...LIGHT_BASIC_COLORS,
        ...LIGHT_SEMANTIC_COLORS,
        ...LIGHT_BOX_SHADOW,
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

const DARK_THEME_TOKENS = {
    ...DARK_BASIC_COLORS,
    ...DARK_SEMANTIC_COLORS,
    ...DARK_BOX_SHADOW,
};

createGlobalTheme(':root', vars, { '@layer': layers.theme, ...THEME_TOKENS });

createGlobalTheme(`:root.${DARK_CLASS_NAME}`, vars.color, {
    '@layer': layers.theme,
    ...DARK_THEME_TOKENS,
});
