import { recipe } from '@vanilla-extract/recipes';

import { vars } from '~/styles/contract.css';
import { layerStyle } from '~/styles/layers.css';
import { interaction } from '~/styles/mixins/interactions.css';
import { visuallyHidden } from '~/styles/mixins/visually-hidden.css';
import { typographySprinkles } from '~/styles/sprinkles';

export const root = recipe({
    base: layerStyle('component', {
        display: 'inline-flex',
        alignItems: 'center',
        gap: vars.size.space[100],
        verticalAlign: 'middle',
    }),

    defaultVariants: { disabled: false },
    variants: {
        disabled: {
            true: layerStyle('component', { opacity: 0.32, pointerEvents: 'none' }),
        },
    },
});

export const label = recipe({
    base: [
        typographySprinkles({ typography: 'body2' }),
        layerStyle('component', { color: vars.color.foreground.normal }),
    ],

    defaultVariants: { visuallyHidden: false },
    variants: {
        visuallyHidden: {
            true: visuallyHidden,
        },
    },
});

export const control = recipe({
    base: [
        interaction(),
        layerStyle('component', {
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
                '&[data-state="checked"], &[data-state="indeterminate"]': {
                    backgroundColor: vars.color.background.primary,
                },
            },
        }),
    ],

    defaultVariants: {
        invalid: false,
        size: 'md',
    },

    variants: {
        invalid: {
            true: layerStyle('component', { borderColor: vars.color.border.danger }),
        },

        size: {
            md: layerStyle('component', {
                borderRadius: vars.size.borderRadius[100],
                width: vars.size.dimension[200],
                height: vars.size.dimension[200],
            }),
            lg: layerStyle('component', {
                borderRadius: vars.size.borderRadius[200],
                width: vars.size.dimension[300],
                height: vars.size.dimension[300],
            }),
        },
    },
});

export const indicator = recipe({
    base: layerStyle('component', {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: vars.color.white,
    }),

    defaultVariants: { size: 'md' },
    variants: {
        size: {
            md: layerStyle('component', {
                width: vars.size.dimension[100],
                height: vars.size.dimension[100],
            }),
            lg: layerStyle('component', {
                width: vars.size.dimension[150],
                height: vars.size.dimension[150],
            }),
        },
    },
});
