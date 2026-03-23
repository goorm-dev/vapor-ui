import type { RecipeVariants } from '@vanilla-extract/recipes';

import { interaction } from '~/styles/mixins/interactions.css';
import { componentRecipe, componentStyle } from '~/styles/mixins/layer-style.css';
import { vars } from '~/styles/themes.css';

export const root = componentRecipe({
    base: [
        interaction(),
        {
            position: 'relative',

            display: 'flex',
            flexShrink: 0,
            alignItems: 'center',
            justifyContent: 'center',
            gap: vars.size.space[100],

            boxShadow: `inset 0 0 0 0.0625rem ${vars.color.border.normal}`,

            backgroundColor: vars.color.background.canvas[100],

            transitionProperty: 'background-color, box-shadow',
            transitionDuration: '0.2s',

            padding: vars.size.space['000'],
            overflow: 'hidden',

            selectors: {
                '&[data-checked], &[data-indeterminate]': {
                    boxShadow: 'none',
                    backgroundColor: vars.color.background.primary[200],
                },

                '&[data-readonly]': { backgroundColor: vars.color.gray['200'] },
                '&[data-readonly]:active::before': { opacity: 0.08 },

                '&[data-invalid]': { boxShadow: `inset 0 0 0 1px ${vars.color.border.danger}` },
                '&[data-invalid][data-checked], &[data-invalid][data-indeterminate]': {
                    boxShadow: 'none',
                    backgroundColor: vars.color.background.danger[200],
                },

                '&[data-disabled]::before': { opacity: 0 },
                '&[data-disabled]': { opacity: 0.32, pointerEvents: 'none' },
            },
        },
    ],

    defaultVariants: { invalid: false, size: 'md' },

    variants: {
        invalid: { true: {}, false: {} },

        size: {
            md: {
                borderRadius: vars.size.borderRadius[100],
                width: vars.size.dimension[200],
                height: vars.size.dimension[200],
            },
            lg: {
                borderRadius: vars.size.borderRadius[200],
                width: vars.size.dimension[300],
                height: vars.size.dimension[300],
            },
        },
    },
});

export const indicator = componentRecipe({
    base: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: vars.color.white,
        selectors: {
            '&[data-readonly]': {
                color: vars.color.foreground.hint['100'],
            },
        },
    },

    defaultVariants: { size: 'md' },
    variants: {
        size: {
            md: {
                width: vars.size.dimension[100],
                height: vars.size.dimension[100],
            },
            lg: {
                width: vars.size.dimension[150],
                height: vars.size.dimension[150],
            },
        },
    },
});

export const icon = componentStyle({
    transition: 'all 0.2s',
    fill: 'none',
    stroke: vars.color.white,
    strokeWidth: '4px',
    strokeDasharray: '22',
    strokeDashoffset: '66px',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',

    selectors: {
        [`${indicator.classNames.base}[data-checked] > &`]: {
            strokeDashoffset: '44px',
        },

        [`${indicator.classNames.base}[data-readonly] > &`]: {
            stroke: vars.color.foreground.hint['100'],
        },
    },
});

export type RootVariants = NonNullable<RecipeVariants<typeof root>>;
