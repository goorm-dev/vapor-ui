import { createVar } from '@vanilla-extract/css';
import type { RecipeVariants } from '@vanilla-extract/recipes';
import { recipe } from '@vanilla-extract/recipes';

import { interaction } from '~/styles/mixins/interactions.css';
import { layerStyle } from '~/styles/mixins/layer-style.css';
import { vars } from '~/styles/themes.css';

export const list = recipe({
    base: layerStyle('components', {
        display: 'flex',
        gap: vars.size.space[100],

        listStyle: 'none',
    }),

    defaultVariants: { direction: 'horizontal' },
    variants: {
        /**
         * Determines the layout direction of the navigation menu.
         */
        direction: {
            horizontal: layerStyle('components', { flexDirection: 'row' }),
            vertical: layerStyle('components', { flexDirection: 'column' }),
        },
    },
});

export const link = recipe({
    base: [
        interaction(),

        layerStyle('components', {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',

            borderRadius: vars.size.borderRadius[300],
            backgroundColor: 'transparent',

            paddingBlock: 0,
            width: '100%',

            textWrap: 'nowrap',
            color: vars.color.foreground.normal[100],

            selectors: {
                '&[data-selected]': {
                    color: vars.color.foreground.primary[200],
                },

                '&[data-disabled]': { pointerEvents: 'none', opacity: 0.32 },
            },
        }),
    ],

    defaultVariants: {
        size: 'md',
    },
    variants: {
        /**
         * Determines the size of the navigation link.
         */
        size: {
            sm: layerStyle('components', {
                gap: vars.size.space['075'],
                paddingInline: vars.size.space[100],
                height: vars.size.dimension['300'],

                lineHeight: vars.typography.lineHeight['050'],
                letterSpacing: vars.typography.letterSpacing['000'],
                fontSize: vars.typography.fontSize['050'],
                fontWeight: vars.typography.fontWeight['500'],
            }),
            md: layerStyle('components', {
                gap: vars.size.space['075'],
                paddingInline: vars.size.space[150],
                height: vars.size.dimension['400'],

                lineHeight: vars.typography.lineHeight['075'],
                letterSpacing: vars.typography.letterSpacing['100'],
                fontSize: vars.typography.fontSize['075'],
                fontWeight: vars.typography.fontWeight['500'],
            }),
            lg: layerStyle('components', {
                gap: vars.size.space['075'],
                paddingInline: vars.size.space[200],
                height: vars.size.dimension['500'],

                lineHeight: vars.typography.lineHeight['075'],
                letterSpacing: vars.typography.letterSpacing['100'],
                fontSize: vars.typography.fontSize['075'],
                fontWeight: vars.typography.fontWeight['500'],
            }),
            xl: layerStyle('components', {
                gap: vars.size.space['075'],
                paddingInline: vars.size.space[300],
                height: vars.size.dimension['600'],

                lineHeight: vars.typography.lineHeight['100'],
                letterSpacing: vars.typography.letterSpacing['100'],
                fontSize: vars.typography.fontSize['100'],
                fontWeight: vars.typography.fontWeight['500'],
            }),
        },
    },
});

export const trigger = layerStyle('components', {
    selectors: { '&[data-disabled]': { opacity: 0.32, pointerEvents: 'none' } },
});

export const icon = layerStyle('components', {
    display: 'flex',
    flexShrink: 0,
});

const durationVar = createVar('duration');
const easingVar = createVar('easing');

export const positioner = layerStyle('components', {
    transitionProperty: 'top, left, right, bottom',
    transitionDuration: durationVar,
    transitionTimingFunction: easingVar,
    width: 'var(--positioner-width)',
    height: 'var(--positioner-height)',

    vars: {
        [durationVar]: '0.25s',
        [easingVar]: 'cubic-bezier(.23, 1, .32, 1)',
    },
});

export const popup = layerStyle('components', {
    outline: `1px solid ${vars.color.border.normal}`,

    borderRadius: vars.size.borderRadius[300],
    boxShadow: vars.shadow.md,

    backgroundColor: vars.color.background.overlay[100],

    transformOrigin: 'var(--transform-origin)',
    transitionProperty: 'opacity, transform, width, height',
    transitionDuration: durationVar,
    transitionTimingFunction: easingVar,

    width: 'var(--popup-width)',
    height: 'var(--popup-height)',

    selectors: {
        '&[data-starting-style], &[data-ending-style]': {
            opacity: 0,
            transform: 'scale(0.9)',
        },
        '&[data-ending-style]': {
            transitionTimingFunction: 'ease',
            transitionDuration: '0.15s',
        },
    },
});

export const content = layerStyle('components', {
    width: '100%',
    height: '100%',

    paddingBlock: vars.size.space[150],
    paddingInline: vars.size.space[200],

    whiteSpace: 'nowrap',
    transition: `opacity calc(${durationVar} * 0.5) ease, transform ${durationVar} ${easingVar}`,

    selectors: {
        '&[data-starting-style], &[data-ending-style]': {
            opacity: 0,
        },
        '&[data-starting-style] &[data-activation-direction="left"]': {
            transform: 'translateX(-50%)',
        },
        '&[data-starting-style] &[data-activation-direction="right"]': {
            transform: 'translateX(50%)',
        },
        '&[data-ending-style] &[data-activation-direction="left"]': {
            transform: 'translateX(50%)',
        },
        '&[data-ending-style] &[data-activation-direction="right"]': {
            transform: 'translateX(-50%)',
        },
    },
});

export const viewport = layerStyle('components', {
    position: 'relative',
    overflow: 'hidden',
    width: '100%',
    height: '100%',
});

export const arrow = layerStyle('components', {
    display: 'flex',
    color: vars.color.background.overlay[100],

    transition: `left ${durationVar} ${easingVar}`,

    selectors: {
        '&[data-side="top"]': {
            bottom: '-8px',
            transform: 'rotate(-180deg)',
        },
        '&[data-side="right"]': {
            left: '-12px',
            transform: 'rotate(-90deg)',
        },
        '&[data-side="bottom"]': {
            top: '-8px',
            transform: 'rotate(0deg)',
        },
        '&[data-side="left"]': {
            right: '-12px',
            transform: 'rotate(90deg)',
        },

        '&[data-starting-style], &[data-ending-style]': {
            opacity: 0,
        },
    },
});

export type ListVariants = NonNullable<RecipeVariants<typeof list>>;
export type LinkVariants = NonNullable<RecipeVariants<typeof link>>;
