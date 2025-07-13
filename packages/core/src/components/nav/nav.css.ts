import type { RecipeVariants } from '@vanilla-extract/recipes';
import { recipe } from '@vanilla-extract/recipes';

import { interaction } from '~/styles/mixins/interactions.css';
import { layerStyle } from '~/styles/utils/layer-style.css';
import { vars } from '~/styles/vars.css';

export const list = recipe({
    base: layerStyle('vapor-component', {
        display: 'flex',
        gap: vars.size.space[100],
    }),

    defaultVariants: { direction: 'horizontal', stretch: false },
    variants: {
        stretch: {
            true: layerStyle('vapor-component', { display: 'flex' }),
            false: layerStyle('vapor-component', { display: 'inline-flex' }),
        },
        direction: {
            horizontal: layerStyle('vapor-component', { flexDirection: 'row' }),
            vertical: layerStyle('vapor-component', { flexDirection: 'column' }),
        },
    },
});

export const item = recipe({
    variants: { stretch: { true: layerStyle('vapor-component', { flex: 1 }) } },
});

export const link = recipe({
    base: [
        interaction(),

        layerStyle('vapor-component', {
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',

            paddingBlock: 0,

            width: '100%',
            borderRadius: vars.size.borderRadius[300],
        }),
    ],

    defaultVariants: {
        size: 'md',
        shape: 'fill',
        align: 'center',
        disabled: false,
    },
    variants: {
        disabled: {
            true: layerStyle('vapor-component', {
                pointerEvents: 'none',
                opacity: 0.32,
            }),
        },
        align: {
            start: layerStyle('vapor-component', { justifyContent: 'start' }),
            center: layerStyle('vapor-component', { justifyContent: 'center' }),
            end: layerStyle('vapor-component', { justifyContent: 'end' }),
        },
        shape: {
            fill: [
                layerStyle('vapor-component', {
                    // !NOTE: `rgb-hint` is not a semantic. Consider using `rgb-secondary` or similar.
                    backgroundColor: `rgba(${vars.color.background['rgb-hint']}, 0.08)`,
                    color: vars.color.foreground['normal-lighter'],

                    selectors: {
                        '&[aria-current="page"]': {
                            backgroundColor: `rgba(${vars.color.background['rgb-primary']}, 0.24)`,
                            color: vars.color.foreground['primary-darker'],
                        },
                    },
                }),
            ],
            ghost: layerStyle('vapor-component', {
                backgroundColor: 'transparent',
                color: vars.color.foreground['normal-lighter'],

                selectors: {
                    '&[aria-current="page"]': {
                        color: vars.color.foreground['primary-darker'],
                    },
                },
            }),
        },
        size: {
            sm: layerStyle('vapor-component', {
                gap: vars.size.space['075'],
                paddingInline: vars.size.space[100],
                height: vars.size.dimension['300'],

                lineHeight: vars.typography.lineHeight['050'],
                letterSpacing: vars.typography.letterSpacing['000'],
                fontSize: vars.typography.fontSize['050'],
                fontWeight: vars.typography.fontWeight['500'],
            }),
            md: layerStyle('vapor-component', {
                gap: vars.size.space['075'],
                paddingInline: vars.size.space[150],
                height: vars.size.dimension['400'],

                lineHeight: vars.typography.lineHeight['075'],
                letterSpacing: vars.typography.letterSpacing['100'],
                fontSize: vars.typography.fontSize['075'],
                fontWeight: vars.typography.fontWeight['500'],
            }),
            lg: layerStyle('vapor-component', {
                gap: vars.size.space['075'],
                paddingInline: vars.size.space[200],
                height: vars.size.dimension['500'],

                lineHeight: vars.typography.lineHeight['075'],
                letterSpacing: vars.typography.letterSpacing['100'],
                fontSize: vars.typography.fontSize['075'],
                fontWeight: vars.typography.fontWeight['500'],
            }),
            xl: layerStyle('vapor-component', {
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

export type ListVariants = NonNullable<RecipeVariants<typeof list>>;
export type ItemVariants = NonNullable<RecipeVariants<typeof item>>;
export type LinkVariants = NonNullable<RecipeVariants<typeof link>>;
