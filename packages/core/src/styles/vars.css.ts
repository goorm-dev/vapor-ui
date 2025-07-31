import { createGlobalThemeContract } from '@vanilla-extract/css';

import {
    BORDER_RADIUS,
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

export const vars = createGlobalThemeContract(THEME_TOKENS, (_, path) => `vapor-${path.join('-')}`);
