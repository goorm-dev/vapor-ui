import type { RecipeVariants } from '@vanilla-extract/recipes';
import { recipe } from '@vanilla-extract/recipes';

import { interaction } from '~/styles/mixins/interactions.css';
import { layerStyle } from '~/styles/utils/layer-style.css';
import { vars } from '~/styles/vars.css';

export const control = recipe({
    base: [
        interaction(),
        layerStyle('components', {
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
                    backgroundColor: vars.color.background.primary,
                },
                '&[data-readonly]': {
                    backgroundColor: vars.color.gray[200],
                    outline: '0.0625rem solid',
                    outlineColor: vars.color.border.normal,
                    outlineOffset: '-0.0625rem',
                },
                '&:disabled': { opacity: 0.32, pointerEvents: 'none' },

                '&[data-readonly]:active::before': {
                    opacity: 0.08,
                },
            },
        }),
    ],

    defaultVariants: { size: 'md' },
    variants: {
        size: {
            sm: layerStyle('components', {
                padding: vars.size.space['025'],
                width: vars.size.dimension['400'],
                height: vars.size.dimension['225'],
            }),
            md: layerStyle('components', {
                padding: vars.size.space['050'],
                width: vars.size.dimension['500'],
                height: vars.size.dimension['300'],
            }),
            lg: layerStyle('components', {
                padding: vars.size.space['050'],
                width: vars.size.dimension['700'],
                height: vars.size.dimension['400'],
            }),
        },
    },
});

export const indicator = recipe({
    base: layerStyle('components', {
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
                backgroundColor: vars.color.foreground.hint,
                boxShadow: 'none',
            },
        },
    }),

    defaultVariants: { size: 'md' },
    variants: {
        size: {
            sm: layerStyle('components', {
                width: vars.size.dimension['175'],
                height: vars.size.dimension['175'],
            }),
            md: layerStyle('components', {
                width: vars.size.dimension['200'],
                height: vars.size.dimension['200'],
            }),
            lg: layerStyle('components', {
                width: vars.size.dimension['300'],
                height: vars.size.dimension['300'],
            }),
        },
    },
});

export type ControlVariants = NonNullable<RecipeVariants<typeof control>>;
