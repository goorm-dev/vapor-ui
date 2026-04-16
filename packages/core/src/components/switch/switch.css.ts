import type { RecipeVariants } from '@vanilla-extract/recipes';

import { interaction } from '~/styles/mixins/interactions.css';
import { componentRecipe } from '~/styles/mixins/layer-style.css';
import { vars } from '~/styles/themes.css';

export const control = componentRecipe({
    base: [
        interaction(),
        {
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            border: 'none',
            borderRadius: '9999px',
            backgroundColor: vars.color.gray[400],
            cursor: 'pointer',

            flexShrink: 0,

            selectors: {
                '&[data-checked]': {
                    backgroundColor: vars.color.background.primary[200],
                },

                '&[data-disabled]': { opacity: 0.32, pointerEvents: 'none' },

                '&[data-readonly]': {
                    backgroundColor: vars.color.gray[200],
                    border: `0.0625rem solid ${vars.color.border.normal}`,
                },
                '&[data-readonly]:active::before': { opacity: 0.08 },

                '&[data-invalid]:not(:focus-visible)': {
                    outline: '0.125rem solid',
                    outlineColor: vars.color.border.danger,
                    outlineOffset: '0.125rem',
                },
            },
        },
    ],

    defaultVariants: { size: 'md', invalid: false },
    variants: {
        invalid: { true: {}, false: {} },
        size: {
            sm: {
                padding: vars.size.space['025'],
                width: vars.size.dimension['400'],
                height: vars.size.dimension['225'],
            },
            md: {
                padding: vars.size.space['050'],
                width: vars.size.dimension['500'],
                height: vars.size.dimension['300'],
            },
            lg: {
                padding: vars.size.space['050'],
                width: vars.size.dimension['700'],
                height: vars.size.dimension['400'],
            },
        },
    },
});

export const indicator = componentRecipe({
    base: {
        display: 'block',

        transition: 'transform 0.1s ease',
        willChange: 'transform',
        borderRadius: '100%',

        boxShadow: '0px 4px 10px 0px rgba(0, 0, 0, 0.20)',
        backgroundColor: 'white',

        selectors: {
            '&[data-checked]': {
                transform: 'translateX(100%)',
            },
            '&[data-readonly][data-unchecked]': {
                backgroundColor: vars.color.gray[400],
                boxShadow: 'none',
            },
            '&[data-readonly][data-checked]': {
                backgroundColor: vars.color.foreground.hint[100],
                boxShadow: 'none',
            },
        },
    },

    defaultVariants: { size: 'md' },
    variants: {
        size: {
            sm: {
                width: vars.size.dimension['175'],
                height: vars.size.dimension['175'],
            },
            md: {
                width: vars.size.dimension['200'],
                height: vars.size.dimension['200'],
            },
            lg: {
                width: vars.size.dimension['300'],
                height: vars.size.dimension['300'],
            },
        },
    },
});

export type ControlVariants = NonNullable<RecipeVariants<typeof control>>;
