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

export const LIGHT_CLASS_NAME = 'vapor-light-theme';

export const DARK_CLASS_NAME = 'vapor-dark-theme';

export const THEME_TOKENS = {
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

export const DARK_THEME_TOKENS = {
    ...DARK_BASIC_COLORS,
    ...DARK_SEMANTIC_COLORS,
};

export const SCALE_FACTOR_VAR_NAME = 'vapor-scale-factor';
export const RADIUS_FACTOR_VAR_NAME = 'vapor-radius-factor';

export const INITIAL_SCALE_FACTOR = '1';
export const INITIAL_RADIUS_FACTOR = '1';

export const layerName = {
    theme: 'vapor-theme',
    reset: 'vapor-reset',
    component: 'vapor-component',
    utilities: 'vapor-utilities',
} as const;
