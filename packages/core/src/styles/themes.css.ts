import { createGlobalTheme, createGlobalThemeContract, globalStyle } from '@vanilla-extract/css';

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

const DARK_THEME_TOKENS = {
    ...DARK_BASIC_COLORS,
    ...DARK_SEMANTIC_COLORS,
};

/* -------------------------------------------------------------------------------------------------
 * CSS Variables
 * -----------------------------------------------------------------------------------------------*/

const vars = createGlobalThemeContract(THEME_TOKENS, (_, path) => `vapor-${path.join('-')}`);

createGlobalTheme(`:root, [data-vapor-theme='light']`, vars, {
    '@layer': layers.theme,
    ...THEME_TOKENS,
});

createGlobalTheme(`[data-vapor-theme='dark']`, vars.color, {
    '@layer': layers.theme,
    ...DARK_THEME_TOKENS,
});

/* -------------------------------------------------------------------------------------------------
 * Reset Styles
 * -----------------------------------------------------------------------------------------------*/

globalStyle('*', {
    '@layer': {
        [layers.reset]: {
            boxSizing: 'border-box',
            margin: 0,
            padding: 0,
            fontFamily: vars.typography.fontFamily.sans,
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
        },
    },
});

globalStyle('html, body', {
    '@layer': {
        [layers.reset]: {
            backgroundColor: vars.color.background.canvas[100],
            color: vars.color.foreground.normal[200],
        },
    },
});

globalStyle(
    'a, area, button, [role="button"], input:not([type="range"]), label, select, summary, textarea',
    {
        '@layer': {
            [layers.reset]: {
                textDecoration: 'none',
            },
        },
    },
);

globalStyle('[role="button"]', {
    '@layer': {
        [layers.reset]: {
            background: 'none',
        },
    },
});

globalStyle('input, button, select, optgroup, textarea', {
    '@layer': {
        [layers.reset]: {
            border: 'none',
            borderRadius: 0,
            backgroundColor: 'transparent',
            color: 'inherit',
            font: 'inherit',
            fontFeatureSettings: 'inherit',
            fontVariationSettings: 'inherit',
        },
    },
});

globalStyle('button, html [type="button"], [type="reset"], [type="submit"]', {
    '@layer': {
        [layers.reset]: {
            WebkitAppearance: 'none',
        },
    },
});

globalStyle('input, textarea', {
    '@layer': {
        [layers.reset]: {
            appearance: 'none',
            WebkitAppearance: 'none',
        },
    },
});

globalStyle('ul, ol', {
    '@layer': {
        [layers.reset]: {
            listStyle: 'none',
        },
    },
});

globalStyle('button, a', {
    '@layer': {
        [layers.reset]: {
            cursor: 'pointer',
        },
    },
});

export { vars };
