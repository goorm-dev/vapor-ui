// tabs.css.ts
import { createVar } from '@vanilla-extract/css';
import { calc } from '@vanilla-extract/css-utils';
import type { RecipeVariants } from '@vanilla-extract/recipes';
import { recipe } from '@vanilla-extract/recipes';

import { foregrounds } from '~/styles/mixins/foreground.css';
import { interaction } from '~/styles/mixins/interactions.css';
import { layerStyle } from '~/styles/mixins/layer-style.css';
import { typography } from '~/styles/mixins/typography.css';
import { vars } from '~/styles/themes.css';

const EXTERNAL_VARS = {
    activeTabWidth: '--active-tab-width',
    activeTabHeight: '--active-tab-height',
    activeTabLeft: '--active-tab-left',
    activeTabTop: '--active-tab-top',
} as const;

const BORDER_WIDTH = '0.0625rem'; // 1px

const listBorderBottom = createVar();
const listBorderRight = createVar();
const listBorder = createVar();

const indicatorVerticalWidth = createVar();
const indicatorHorizontalHeight = createVar();
const indicatorBottomPosition = createVar();
const indicatorRightPosition = createVar();

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
                height: '100%',
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
        isolation: 'isolate', // NOTE: Creates a new stacking context to manage z-index only within the Tabs component.
    }),

    defaultVariants: { variant: 'line', orientation: 'horizontal' },
    variants: {
        orientation: {
            horizontal: layerStyle('components', {
                display: 'flex',
                vars: {
                    [listBorderBottom]: listBorder,
                    [listBorderRight]: 'none',
                },
            }),
            vertical: layerStyle('components', {
                display: 'inline-flex',
                flexDirection: 'column',
                vars: {
                    [listBorderBottom]: 'none',
                    [listBorderRight]: listBorder,
                },
            }),
        },
        variant: {
            line: layerStyle('components', {
                vars: {
                    [listBorder]: `${BORDER_WIDTH} solid ${vars.color.border.normal}`,
                },
            }),
            fill: layerStyle('components', {
                vars: {
                    [listBorder]: 'none',
                },
            }),
        },
    },
});

export const trigger = recipe({
    base: [
        foregrounds({ color: 'normal-100' }),
        interaction({ scale: 'light' }),
        typography({ style: 'subtitle1' }),
        layerStyle('components', {
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: vars.size.space['075'],
            zIndex: 1,
        }),
    ],

    defaultVariants: { size: 'md', disabled: false, variant: 'line', orientation: 'horizontal' },
    variants: {
        size: {
            sm: [
                typography({ style: 'subtitle2' }),
                layerStyle('components', { height: vars.size.space['300'] }),
            ],
            md: [layerStyle('components', { height: vars.size.space['400'] })],
            lg: [layerStyle('components', { height: vars.size.space['500'] })],
            xl: [
                typography({ style: 'heading6' }),
                layerStyle('components', { height: vars.size.space['600'] }),
            ],
        },
        variant: {
            line: layerStyle('components', {
                borderRadius: `${vars.size.borderRadius[300]} ${vars.size.borderRadius[300]} 0 0`,
            }),
            fill: layerStyle('components', {
                borderRadius: vars.size.borderRadius[300],
                selectors: {
                    '&[data-selected]': {
                        color: vars.color.foreground.primary['100'],
                    },
                },
            }),
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
        transitionDuration: '100ms',
        transitionTimingFunction: 'ease-in-out',
        zIndex: 0,
    }),

    defaultVariants: { orientation: 'horizontal', variant: 'line' },
    variants: {
        orientation: {
            horizontal: layerStyle('components', {
                bottom: indicatorBottomPosition,
                transform: `translateX(var(${EXTERNAL_VARS.activeTabLeft}))`,
                width: calc.add(`var(${EXTERNAL_VARS.activeTabWidth})`, '0.06rem'),
                height: indicatorHorizontalHeight,
                transitionProperty: 'transform, width',
            }),
            vertical: layerStyle('components', {
                right: indicatorRightPosition,
                transform: `translateY(var(${EXTERNAL_VARS.activeTabTop}))`,
                height: `var(${EXTERNAL_VARS.activeTabHeight})`,
                width: indicatorVerticalWidth,
                transitionProperty: 'transform, height',
            }),
        },
        variant: {
            line: layerStyle('components', {
                backgroundColor: vars.color.border.primary,
                vars: {
                    [indicatorBottomPosition]: `-${BORDER_WIDTH}`,
                    [indicatorRightPosition]: `-${BORDER_WIDTH}`,
                    [indicatorHorizontalHeight]: `${BORDER_WIDTH}`,
                    [indicatorVerticalWidth]: `${BORDER_WIDTH}`,
                },
            }),
            fill: layerStyle('components', {
                backgroundColor: vars.color.background.primary['100'],
                borderRadius: vars.size.borderRadius[300],
                vars: {
                    [indicatorBottomPosition]: '0',
                    [indicatorRightPosition]: '0',
                    [indicatorHorizontalHeight]: '100%',
                    [indicatorVerticalWidth]: `100%`,
                },
            }),
        },
    },
});

export type ListVariants = NonNullable<RecipeVariants<typeof list>>;
export type TriggerVariants = NonNullable<RecipeVariants<typeof trigger>>;
