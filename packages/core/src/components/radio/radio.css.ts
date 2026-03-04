import { createVar } from '@vanilla-extract/css';
import type { RecipeVariants } from '@vanilla-extract/recipes';
import { recipe } from '@vanilla-extract/recipes';

import { interaction } from '~/styles/mixins/interactions.css';
import { layerStyle } from '~/styles/mixins/layer-style.css';
import { vars } from '~/styles/themes.css';

const borderColor = createVar('border-color');

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

            boxShadow: `inset 0 0 0 0.0625rem ${borderColor}`,
            borderRadius: 9999,

            backgroundColor: vars.color.background.canvas[100],
            cursor: 'pointer',

            padding: vars.size.space['000'],

            selectors: {
                '&[data-checked]': {
                    backgroundColor: vars.color.background.primary[200],
                    boxShadow: 'none',
                },

                // NOTE: Prevents interaction styles from being applied when hovering over the label of a disabled radio button.
                '&[data-disabled]::before': { opacity: 0 },
                '&[data-disabled]': { opacity: 0.32, pointerEvents: 'none' },

                '&[data-readonly]': { backgroundColor: vars.color.gray['200'] },
                '&[data-readonly]:active::before': { opacity: 0.08 },

                '&[data-invalid]': { vars: { [borderColor]: vars.color.border.danger } },
            },

            vars: { [borderColor]: vars.color.border.normal },
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
