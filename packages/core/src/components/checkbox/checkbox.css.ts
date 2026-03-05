import { globalStyle } from '@vanilla-extract/css';
import type { RecipeVariants } from '@vanilla-extract/recipes';
import { recipe } from '@vanilla-extract/recipes';

import { interaction } from '~/styles/mixins/interactions.css';
import { layerStyle } from '~/styles/mixins/layer-style.css';
import { vars } from '~/styles/themes.css';

export const root = recipe({
    base: [
        interaction(),
        layerStyle('components', {
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
                    boxShadow: 'none',
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
        }),
    ],

    defaultVariants: { invalid: false, size: 'md' },

    variants: {
        invalid: { true: {}, false: {} },

        size: {
            md: layerStyle('components', {
                borderRadius: vars.size.borderRadius[100],
                width: vars.size.dimension[200],
                height: vars.size.dimension[200],
            }),
            lg: layerStyle('components', {
                borderRadius: vars.size.borderRadius[200],
                width: vars.size.dimension[300],
                height: vars.size.dimension[300],
            }),
        },
    },
});

export const indicator = recipe({
    base: layerStyle('components', {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: vars.color.white,
        selectors: {
            '&[data-readonly]': {
                color: vars.color.foreground.hint['100'],
            },
        },
    }),

    defaultVariants: { size: 'md' },
    variants: {
        size: {
            md: layerStyle('components', {
                width: vars.size.dimension[100],
                height: vars.size.dimension[100],
            }),
            lg: layerStyle('components', {
                width: vars.size.dimension[150],
                height: vars.size.dimension[150],
            }),
        },
    },
});

export const icon = layerStyle('components', {
    transition: 'all 0.2s',
    fill: 'none',
    stroke: vars.color.white,
    strokeWidth: '4px',
    strokeDasharray: '22',
    strokeDashoffset: '66px',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',

    // selectors: {
    //     [`${indicator}[data-checked] > &`]: {
    //         strokeDashoffset: '44px',
    //     },

    //     [`${indicator}[data-readonly] > &`]: {
    //         stroke: vars.color.foreground.hint['100'],
    //     },
    // },
});

globalStyle(`${indicator}[data-checked] > svg`, {
    transition: 'all 0.2s',
});

globalStyle(`${indicator}[data-checked] > ${icon}`, {
    strokeDashoffset: '44px',
});

globalStyle(`${indicator}[data-readonly] > ${icon}`, {
    stroke: vars.color.foreground.hint['100'],
});

export type RootVariants = NonNullable<RecipeVariants<typeof root>>;
