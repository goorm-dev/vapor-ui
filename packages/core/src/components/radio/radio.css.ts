import type { RecipeVariants } from '@vanilla-extract/recipes';
import { recipe } from '@vanilla-extract/recipes';

import { interaction } from '~/styles/mixins/interactions.css';
import { vars } from '~/styles/themes.css';
import { layerStyle } from '~/styles/utils';

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

            border: `0.0625rem solid ${vars.color.border.normal}`,
            borderRadius: 9999,

            backgroundColor: vars.color.background.canvas,
            cursor: 'pointer',

            padding: vars.size.space['000'],

            selectors: {
                '&[data-checked]': {
                    backgroundColor: vars.color.background.primary[200],
                },

                // NOTE: Prevents interaction styles from being applied when hovering over the label of a disabled radio button.
                '&:disabled::before': { opacity: 0 },
                '&:disabled': { opacity: 0.32, pointerEvents: 'none' },
                '&[data-readonly]': { backgroundColor: vars.color.gray['200'] },

                '&[data-readonly]:active::before': { opacity: 0.08 },
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
                width: vars.size.dimension[200],
                height: vars.size.dimension[200],
            }),
            lg: layerStyle('components', {
                width: vars.size.dimension[300],
                height: vars.size.dimension[300],
            }),
        },
    },
});

export const indicator = layerStyle('components', {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    border: 'none',
    borderRadius: '9999px',
    backgroundColor: vars.color.white,
    width: '50%',
    height: '50%',
    selectors: {
        '&[data-readonly]': {
            backgroundColor: vars.color.foreground.hint[100],
        },
    },
});

export type RootVariants = NonNullable<RecipeVariants<typeof root>>;
