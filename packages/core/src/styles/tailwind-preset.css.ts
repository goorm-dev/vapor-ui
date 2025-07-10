import { createGlobalTheme, createGlobalThemeContract } from '@vanilla-extract/css';

import { vars } from './vars.css';

const tailwindContract = createGlobalThemeContract(
    {
        color: {
            vapor: vars.color,
        },
        font: {
            vapor: vars.typography.fontFamily,
        },
        text: {
            vapor: vars.typography.fontSize,
        },
        'font-weight': {
            vapor: vars.typography.fontWeight,
        },
        tracking: {
            vapor: vars.typography.letterSpacing,
        },
        leading: {
            vapor: vars.typography.lineHeight,
        },
        spacing: {
            vapor: {
                ...vars.size.space,
                ...vars.size.dimension,
            },
        },
        radius: {
            vapor: vars.size.borderRadius,
        },
    },
    (value, path) => {
        return `${path.join('-')}`;
    },
);

const tokenMap = {
    color: {
        vapor: vars.color,
    },
    font: {
        vapor: vars.typography.fontFamily,
    },
    text: {
        vapor: vars.typography.fontSize,
    },
    'font-weight': {
        vapor: vars.typography.fontWeight,
    },
    tracking: {
        vapor: vars.typography.letterSpacing,
    },
    leading: {
        vapor: vars.typography.lineHeight,
    },
    spacing: {
        vapor: {
            ...vars.size.space,
            ...vars.size.dimension,
        },
    },
    radius: {
        vapor: vars.size.borderRadius,
    },
};

createGlobalTheme('@theme', tailwindContract, tokenMap);
