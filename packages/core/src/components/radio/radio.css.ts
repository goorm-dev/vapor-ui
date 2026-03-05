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

            borderRadius: 9999,
            boxShadow: `inset 0 0 0 0.0625rem ${vars.color.border.normal}`,
            backgroundColor: vars.color.background.canvas[100],

            cursor: 'pointer',

            padding: vars.size.space['000'],

            selectors: {
                '&[data-checked]': {
                    boxShadow: 'none',
                    backgroundColor: vars.color.background.primary[200],
                },

                '&[data-readonly]': { backgroundColor: vars.color.gray['200'] },
                '&[data-readonly]:active::before': { opacity: 0.08 },

                '&[data-invalid]': { boxShadow: `inset 0 0 0 1px ${vars.color.border.danger}` },
                '&[data-invalid][data-checked]': {
                    boxShadow: 'none',
                    backgroundColor: vars.color.background.danger[200],
                },

                // NOTE: Prevents interaction styles from being applied when hovering over the label of a disabled radio button.
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
