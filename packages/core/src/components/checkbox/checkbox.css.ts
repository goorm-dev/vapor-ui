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
            padding: vars.size.space['000'],
            overflow: 'hidden',

            selectors: {
                '&[data-checked], &[data-indeterminate]': {
                    backgroundColor: vars.color.background.primary[200],
                    boxShadow: 'none',
                },

                // NOTE: Prevents interaction styles from being applied when hovering over the label of a disabled radio button.
                '&::before': { borderRadius: '0' },

                '&[data-disabled]::before': { opacity: 0 },
                '&[data-disabled]': { opacity: 0.32, pointerEvents: 'none' },

                '&[data-readonly]': {
                    backgroundColor: vars.color.gray['200'],
                },
                '&[data-readonly]:active::before': { opacity: 0.08 },

                '&[data-invalid]': {
                    boxShadow: `inset 0 0 0 0.0625rem ${vars.color.border.danger}`,
                },
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

export type RootVariants = NonNullable<RecipeVariants<typeof root>>;
