import { recipe } from '@vanilla-extract/recipes';

import { interaction } from '~/styles/mixins/interactions.css';
import { visuallyHidden } from '~/styles/mixins/visually-hidden.css';
import { layerStyle } from '~/styles/utils/layer-style.css';
import { vars } from '~/styles/vars.css';

export const root = recipe({
    base: layerStyle('vapor-component', {
        display: 'inline-flex',
        alignItems: 'center',
        gap: vars.size.space['100'],
    }),

    defaultVariants: { disabled: false },
    variants: {
        disabled: {
            true: layerStyle('vapor-component', { opacity: 0.32, pointerEvents: 'none' }),
        },
    },
});

export const control = recipe({
    base: [
        interaction(),
        layerStyle('vapor-component', {
            position: 'relative',
            border: 'none',
            borderRadius: '9999px',
            backgroundColor: vars.color.gray[400],
            cursor: 'pointer',

            selectors: {
                '&[data-state="checked"]': {
                    backgroundColor: vars.color.background.primary,
                },
            },
        }),
    ],

    defaultVariants: { size: 'md' },
    variants: {
        size: {
            sm: layerStyle('vapor-component', {
                padding: vars.size.space['025'],
                width: vars.size.dimension['400'],
                height: vars.size.dimension['225'],
            }),
            md: layerStyle('vapor-component', {
                padding: vars.size.space['050'],
                width: vars.size.dimension['500'],
                height: vars.size.dimension['300'],
            }),
            lg: layerStyle('vapor-component', {
                padding: vars.size.space['050'],
                width: vars.size.dimension['700'],
                height: vars.size.dimension['400'],
            }),
        },
    },
});

export const indicator = recipe({
    base: layerStyle('vapor-component', {
        display: 'block',

        transition: 'transform 0.1s',
        willChange: 'transform',
        borderRadius: '100%',

        boxShadow: '0px 4px 10px 0px rgba(0, 0, 0, 0.20)',
        backgroundColor: 'white',

        selectors: {
            '&[data-state="checked"]': { transform: 'translateX(100%)' },
        },
    }),

    defaultVariants: { size: 'md' },
    variants: {
        size: {
            sm: layerStyle('vapor-component', {
                width: vars.size.dimension['175'],
                height: vars.size.dimension['175'],
            }),
            md: layerStyle('vapor-component', {
                width: vars.size.dimension['200'],
                height: vars.size.dimension['200'],
            }),
            lg: layerStyle('vapor-component', {
                width: vars.size.dimension['300'],
                height: vars.size.dimension['300'],
            }),
        },
    },
});

export const label = recipe({
    base: layerStyle('vapor-component', {
        lineHeight: vars.typography.lineHeight['075'],
        letterSpacing: vars.typography.letterSpacing['100'],
        color: vars.color.foreground['normal'],
        fontSize: vars.typography.fontSize['075'],
        fontWeight: vars.typography.fontWeight['400'],
    }),

    defaultVariants: { visuallyHidden: false },
    variants: {
        visuallyHidden: {
            true: visuallyHidden,
        },
    },
});
