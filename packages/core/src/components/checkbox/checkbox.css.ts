import type { RecipeVariants } from '@vanilla-extract/recipes';
import { recipe } from '@vanilla-extract/recipes';

import { interaction } from '~/styles/mixins/interactions.css';
import { layerStyle } from '~/styles/utils/layer-style.css';
import { vars } from '~/styles/vars.css';

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

            border: '0.0625rem solid',
            borderColor: vars.color.border.normal,

            backgroundColor: vars.color.background['normal-darker'],
            padding: vars.size.space['000'],

            selectors: {
                '&[data-checked], &[data-indeterminate]': {
                    backgroundColor: vars.color.background.primary,
                },

                // NOTE: Prevents interaction styles from being applied when hovering over the label of a disabled radio button.
                '&:disabled::before': { opacity: 0 },
                '&:disabled': { opacity: 0.32, pointerEvents: 'none' },
            },
        }),
    ],

    defaultVariants: {
        invalid: false,
        size: 'md',
    },

    variants: {
        invalid: {
            true: layerStyle('components', { borderColor: vars.color.border.danger }),
        },

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
