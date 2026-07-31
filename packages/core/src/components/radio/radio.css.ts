import { createVar } from '@vanilla-extract/css';
import type { RecipeVariants } from '@vanilla-extract/recipes';

import { interaction } from '~/styles/mixins/interactions.css';
import { componentRecipe, componentStyle } from '~/styles/mixins/layer-style.css';
import { when } from '~/styles/mixins/logical-states';
import { vars } from '~/styles/themes.css';

const boxShadowColor = createVar('box-shadow-color');

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

            transitionDuration: '0.2s',
            transitionProperty: 'background-color, box-shadow',
            borderRadius: 9999,

            boxShadow: `inset 0 0 0 0.0625rem ${boxShadowColor}`,
            backgroundColor: vars.color.background.canvas[100],

            cursor: 'pointer',

            padding: vars.size.space['000'],

            selectors: {
                '&[data-checked]': {
                    boxShadow: 'none',
                    backgroundColor: vars.color.background.primary[200],
                },

                [when.invalid()]: { vars: { [boxShadowColor]: vars.color.border.danger } },
                [when.invalid('&[data-invalid][data-checked]')]: {
                    boxShadow: 'none',
                    backgroundColor: vars.color.background.danger[200],
                },

                [when.readonly()]: { backgroundColor: vars.color.gray['200'] },
                [`${when.readonly()}:active::before`]: { opacity: 0.08 },

                // NOTE: Prevents interaction styles from being applied when hovering over the label of a disabled radio button.
                [`${when.disabled()}::before`]: { opacity: 0 },
                [when.disabled()]: { opacity: 0.32, pointerEvents: 'none' },
            },

            vars: { [boxShadowColor]: vars.color.border.normal },
        },
    ],

    defaultVariants: { invalid: false, size: 'md' },

    variants: {
        invalid: { true: {}, false: {} },

        size: {
            md: {
                width: vars.size.dimension[200],
                height: vars.size.dimension[200],
            },
            lg: {
                width: vars.size.dimension[300],
                height: vars.size.dimension[300],
            },
        },
    },
});

export const indicator = componentStyle({
    position: 'absolute',
    inset: 0,
    transitionDuration: '0.2s',
    transitionProperty: 'background-color, box-shadow, scale',
    border: 'none',
    borderRadius: '9999px',
    backgroundColor: vars.color.white,
    scale: 0,

    selectors: {
        '&[data-checked]': { scale: 0.5 },
        [when.readonly()]: {
            backgroundColor: vars.color.foreground.hint[100],
        },
    },
});

export type RootVariants = NonNullable<RecipeVariants<typeof root>>;
