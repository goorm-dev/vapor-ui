import { createVar, style } from '@vanilla-extract/css';
import type { RecipeVariants } from '@vanilla-extract/recipes';
import { recipe } from '@vanilla-extract/recipes';

import { foregrounds } from '~/styles/mixins/foreground.css';
import { interaction } from '~/styles/mixins/interactions.css';
import { layerStyle } from '~/styles/mixins/layer-style.css';
import { typography } from '~/styles/mixins/typography.css';
import { vars } from '~/styles/themes.css';

const listBorderBottom = createVar();
const listBorderRight = createVar();
const triggerSelectedBg = createVar();
const triggerSelectedBorderRadius = createVar();
const indicatorDisplay = createVar();

export const root = recipe({
    base: layerStyle('components', { display: 'flex' }),

    defaultVariants: { orientation: 'horizontal' },
    variants: {
        orientation: {
            horizontal: layerStyle('components', {
                flexDirection: 'column',
            }),
            vertical: layerStyle('components', {
                flexDirection: 'row',
            }),
        },
    },
});

export const list = recipe({
    base: layerStyle('components', {
        position: 'relative',
        gap: vars.size.space[100],
        borderBottom: listBorderBottom,
        borderRight: listBorderRight,
    }),

    defaultVariants: { variant: 'line', orientation: 'horizontal' },
    variants: {
        orientation: {
            horizontal: layerStyle('components', {
                display: 'flex',
                vars: {
                    [listBorderBottom]: `1px solid ${vars.color.border.normal}`,
                    [listBorderRight]: 'none',
                },
            }),
            vertical: layerStyle('components', {
                display: 'inline-flex',
                flexDirection: 'column',
                vars: {
                    [listBorderBottom]: 'none',
                    [listBorderRight]: `1px solid ${vars.color.border.normal}`,
                },
            }),
        },
        variant: {
            line: layerStyle('components', {
                vars: {
                    [triggerSelectedBg]: 'transparent',
                    [triggerSelectedBorderRadius]: '0',
                    [indicatorDisplay]: 'block',
                },
            }),
            fill: layerStyle('components', {
                vars: {
                    [listBorderBottom]: 'none',
                    [listBorderRight]: 'none',
                    [triggerSelectedBg]: vars.color.background.primary[100],
                    [triggerSelectedBorderRadius]: vars.size.borderRadius[300],
                    [indicatorDisplay]: 'none',
                },
            }),
        },
    },
});

const triggerBase = style([
    foregrounds({ color: 'normal-100' }),
    interaction({ scale: 'light' }),
    layerStyle('components', {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: vars.size.space['075'],
        borderRadius: vars.size.borderRadius['300'],

        selectors: {
            '&[data-selected]': {
                color: vars.color.foreground.primary[100],
                backgroundColor: triggerSelectedBg,
                borderRadius: triggerSelectedBorderRadius,
            },
        },
    }),
]);

export const trigger = recipe({
    base: triggerBase,

    defaultVariants: { size: 'md', disabled: false, orientation: 'horizontal' },
    variants: {
        size: {
            sm: [
                typography({ style: 'subtitle2' }),
                layerStyle('components', { height: vars.size.space['300'] }),
            ],
            md: [
                typography({ style: 'subtitle1' }),
                layerStyle('components', { height: vars.size.space['400'] }),
            ],
            lg: [
                typography({ style: 'subtitle1' }),
                layerStyle('components', { height: vars.size.space['500'] }),
            ],
            xl: [
                typography({ style: 'heading6' }),
                layerStyle('components', { height: vars.size.space['600'] }),
            ],
        },

        disabled: {
            true: layerStyle('components', { opacity: 0.32, pointerEvents: 'none' }),
        },

        orientation: {
            horizontal: layerStyle('components', {
                paddingInline: vars.size.space['050'],
            }),
            vertical: layerStyle('components', {
                paddingInline: vars.size.space[200],
            }),
        },
    },
});

export const indicator = recipe({
    base: layerStyle('components', {
        position: 'absolute',
        display: indicatorDisplay,

        transitionDuration: '200ms',
        transitionProperty: `translate, width`,
        transitionTimingFunction: 'ease-in-out',

        backgroundColor: vars.color.border.primary,
    }),

    defaultVariants: { orientation: 'horizontal' },
    variants: {
        orientation: {
            horizontal: layerStyle('components', {
                bottom: -2,
                left: 0,

                width: `var(--active-tab-width)`,
                height: '2px',
                translate: `var(--active-tab-left) -50%`,
            }),
            vertical: layerStyle('components', {
                top: 0,
                right: -2,

                width: '2px',
                height: `var(--active-tab-height)`,
                translate: `-50% var(--active-tab-top)`,
            }),
        },
    },
});

export type ListVariants = NonNullable<RecipeVariants<typeof list>>;
export type TriggerVariants = NonNullable<RecipeVariants<typeof trigger>>;
