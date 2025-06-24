import { layers } from './layers.css';
import { createGlobalVar, globalStyle } from '@vanilla-extract/css';

globalStyle('*', {
    '@layer': {
        [layers.reset]: {
            boxSizing: 'border-box',
            margin: 0,
            padding: 0,
            fontFamily: `Pretendard Variable, -apple-system, BlinkMacSystemFont, system-ui, Roboto, "Helvetica Neue", "Segoe UI", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif`,
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
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
            lineHeight: 'inherit',
            color: 'inherit',
            fontFamily: 'inherit',
            fontSize: 'inherit',
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

export const SCALE_FACTOR_VAR_NAME = 'vapor-scale-factor';
export const RADIUS_FACTOR_VAR_NAME = 'vapor-radius-factor';

const INITIAL_SCALE_FACTOR = '1';
const INITIAL_RADIUS_FACTOR = '1';

/**
 * For Modern browsers
 */
export const scaleFactorVar = createGlobalVar(SCALE_FACTOR_VAR_NAME, {
    syntax: '<number>',
    inherits: true,
    initialValue: INITIAL_SCALE_FACTOR,
});
export const radiusFactorVar = createGlobalVar(RADIUS_FACTOR_VAR_NAME, {
    syntax: '<number>',
    inherits: true,
    initialValue: INITIAL_RADIUS_FACTOR,
});

/**
 * For Legacy browsers
 */
globalStyle(':root', {
    '@layer': {
        [layers.reset]: {
            vars: {
                [scaleFactorVar]: INITIAL_SCALE_FACTOR,
                [radiusFactorVar]: INITIAL_RADIUS_FACTOR,
            },
        },
    },
});
