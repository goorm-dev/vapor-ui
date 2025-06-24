import './global.css';
import { layers } from './layers.css';
import {
    BORDER_RADIUS,
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
import { createGlobalTheme, createGlobalThemeContract } from '@vanilla-extract/css';

const themeTokens = {
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

export const vars = createGlobalThemeContract(themeTokens, (_, path) => `vapor-${path.join('-')}`);

createGlobalTheme(':root', vars, { '@layer': layers.theme, ...themeTokens });

// TODO: Add dark theme support
// const darkThemeTokens = {}
// createGlobalTheme(':root.dark', vars, {});
