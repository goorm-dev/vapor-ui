import { recipe } from '@vanilla-extract/recipes';

import { vars } from '~/styles/contract.css';
import { layerStyle } from '~/styles/layers.css';
import { interaction } from '~/styles/mixins/interactions.css';
import { visuallyHidden } from '~/styles/mixins/visually-hidden.css';

export const root = recipe({
    base: layerStyle('component', {
        display: 'flex',
    }),

    defaultVariants: { orientation: 'vertical' },
    variants: {
        size: {
            md: layerStyle('component', { gap: vars.size.space['050'] }),
            lg: layerStyle('component', { gap: vars.size.space['100'] }),
        },
        orientation: {
            horizontal: layerStyle('component', { flexDirection: 'row' }),
            vertical: layerStyle('component', { flexDirection: 'column' }),
        },
    },
});

export const item = recipe({
    base: layerStyle('component', {
        display: 'flex',
        flexShrink: 0,
        alignItems: 'center',

        gap: vars.size.space['100'],
    }),

    defaultVariants: { disabled: false },
    variants: {
        disabled: { true: layerStyle('component', { opacity: 0.32, pointerEvents: 'none' }) },
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

            border: `0.0625rem solid ${vars.color.border.normal}`,
            borderRadius: 9999,

            backgroundColor: vars.color.background.normal,
            cursor: 'pointer',

            padding: vars.size.space['000'],

            selectors: {
                '&[data-state="checked"]': {
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
            true: layerStyle('component', { borderColor: vars.color.background['danger'] }),
        },

        size: {
            md: layerStyle('component', {
                width: vars.size.dimension[200],
                height: vars.size.dimension[200],
            }),
            lg: layerStyle('component', {
                width: vars.size.dimension[300],
                height: vars.size.dimension[300],
            }),
        },
    },
});

export const indicator = layerStyle('component', {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    border: 'none',
    borderRadius: '9999px',
    backgroundColor: vars.color.background.normal,
    width: '50%',
    height: '50%',
});

export const label = recipe({
    base: layerStyle('component', {
        lineHeight: vars.typography.lineHeight['075'],

        letterSpacing: vars.typography.letterSpacing['100'],
        color: vars.color.foreground['normal'],
        fontSize: vars.typography.fontSize['075'],
        fontWeight: vars.typography.fontWeight[400],
    }),

    defaultVariants: { visuallyHidden: false },
    variants: {
        visuallyHidden: {
            true: visuallyHidden,
        },
    },
});
