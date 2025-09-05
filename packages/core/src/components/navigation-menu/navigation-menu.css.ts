import type { RecipeVariants } from '@vanilla-extract/recipes';
import { recipe } from '@vanilla-extract/recipes';

import { interaction } from '~/styles/mixins/interactions.css';
import { layerStyle } from '~/styles/utils/layer-style.css';
import { vars } from '~/styles/vars.css';

export const list = recipe({
    base: layerStyle('components', {
        display: 'flex',
        gap: vars.size.space[100],
    }),

    defaultVariants: { direction: 'horizontal', stretch: false },
    variants: {
        stretch: {
            true: layerStyle('components', { display: 'flex' }),
            false: layerStyle('components', { display: 'inline-flex' }),
        },
        direction: {
            horizontal: layerStyle('components', { flexDirection: 'row' }),
            vertical: layerStyle('components', { flexDirection: 'column' }),
        },
    },
});

export const item = recipe({
    variants: { stretch: { true: layerStyle('components', { flex: 1 }) } },
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
            color: vars.color.foreground['normal-lighter'],

            selectors: {
                '&[aria-current="page"]': {
                    color: vars.color.foreground['primary-darker'],
                },

                '&[data-disabled]': { pointerEvents: 'none', opacity: 0.32 },
            },
        }),
    ],

    defaultVariants: {
        size: 'md',
    },
    variants: {
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

export const trigger = link;

export const icon = layerStyle('components', {
    display: 'flex',
});

export const popup = layerStyle('components', {
    outline: 'none',
    border: `1px solid ${vars.color.border.normal}`,

    borderRadius: vars.size.borderRadius[300],
    boxShadow: vars.shadow.md,

    backgroundColor: vars.color.background['normal-lighter'],
    paddingBlock: vars.size.space[150],

    paddingInline: vars.size.space[200],
});

export const arrow = layerStyle('components', {
    display: 'flex',
    color: vars.color.background['normal-lighter'],

    width: vars.size.dimension[100],
    height: vars.size.dimension[200],

    transform: 'rotate(180deg)',
    zIndex: 1,

    selectors: {
        '&[data-side="top"]': {
            bottom: '-11px',
            transform: 'rotate(-90deg)',
        },
        '&[data-side="right"]': {
            left: '-7px',
            transform: 'rotate(0deg)',
        },
        '&[data-side="bottom"]': {
            top: '-11px',
            transform: 'rotate(90deg)',
        },
        '&[data-side="left"]': {
            right: '-7px',
            transform: 'rotate(180deg)',
        },
    },
});

export type ListVariants = NonNullable<RecipeVariants<typeof list>>;
export type ItemVariants = NonNullable<RecipeVariants<typeof item>>;
export type LinkVariants = NonNullable<RecipeVariants<typeof link>>;
