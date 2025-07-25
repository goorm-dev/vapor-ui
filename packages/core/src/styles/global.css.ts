import { globalStyle } from '@vanilla-extract/css';

import { layers } from './layers.css';
import { vars } from './vars.css';

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
            backgroundColor: vars.color.background.normal,
            color: vars.color.foreground.normal,
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
