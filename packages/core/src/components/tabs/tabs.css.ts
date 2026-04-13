import { createVar } from '@vanilla-extract/css';
import type { RecipeVariants } from '@vanilla-extract/recipes';

import { foregrounds } from '~/styles/mixins/foreground.css';
import { interaction } from '~/styles/mixins/interactions.css';
import { componentRecipe } from '~/styles/mixins/layer-style.css';
import { typography } from '~/styles/mixins/typography.css';
import { vars } from '~/styles/themes.css';

const EXTERNAL_VARS = {
    activeTabWidth: '--active-tab-width',
    activeTabHeight: '--active-tab-height',
    activeTabLeft: '--active-tab-left',
    activeTabTop: '--active-tab-top',
} as const;

const BORDER_WIDTH = '0.125rem'; // 2px

const listBorderBottom = createVar();
const listBorderRight = createVar();
const listBorder = createVar();

const buttonVerticalBorderRadius = createVar();
const buttonHorizontalBorderRadius = createVar();

const indicatorVerticalWidth = createVar();
const indicatorHorizontalHeight = createVar();
const indicatorBottomPosition = createVar();
const indicatorRightPosition = createVar();

export const root = componentRecipe({
    base: { display: 'flex' },
    defaultVariants: { orientation: 'horizontal' },
    variants: {
        orientation: {
            horizontal: {
                flexDirection: 'column',
            },
            vertical: {
                flexDirection: 'row',
                height: '100%',
            },
        },
    },
});

export const list = componentRecipe({
    base: {
        position: 'relative',
        gap: vars.size.space[100],
        borderBottom: listBorderBottom,
        borderRight: listBorderRight,
        isolation: 'isolate', // NOTE: Creates a new stacking context to manage z-index only within the Tabs component.
    },

    defaultVariants: { variant: 'line', orientation: 'horizontal' },
    variants: {
        orientation: {
            horizontal: {
                display: 'flex',
                vars: {
                    [listBorderBottom]: listBorder,
                    [listBorderRight]: 'none',
                },
            },
            vertical: {
                display: 'inline-flex',
                flexDirection: 'column',
                vars: {
                    [listBorderBottom]: 'none',
                    [listBorderRight]: listBorder,
                },
            },
        },
        variant: {
            line: {
                vars: {
                    [listBorder]: `${BORDER_WIDTH} solid ${vars.color.border.normal}`,
                },
            },
            fill: {
                vars: {
                    [listBorder]: 'none',
                },
            },
        },
    },
});

export const button = componentRecipe({
    base: [
        foregrounds({ color: 'normal-100' }),
        interaction({ scale: 'light' }),
        typography({ style: 'subtitle1' }),
        {
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: vars.size.space['075'],
            zIndex: 1,

            selectors: {
                '&[data-active]': {
                    color: vars.color.foreground.primary['100'],
                },

                '&[data-disabled]': {
                    opacity: 0.32,
                    pointerEvents: 'none',
                },
            },
        },
    ],

    defaultVariants: { size: 'md', variant: 'line', orientation: 'horizontal' },
    variants: {
        size: {
            sm: [typography({ style: 'subtitle2' }), { height: vars.size.space['300'] }],
            md: [{ height: vars.size.space['400'] }],
            lg: [{ height: vars.size.space['500'] }],
            xl: [typography({ style: 'heading6' }), { height: vars.size.space['600'] }],
        },
        orientation: {
            horizontal: {
                borderRadius: buttonHorizontalBorderRadius,
                paddingInline: vars.size.space['050'],
            },
            vertical: {
                borderRadius: buttonVerticalBorderRadius,
                paddingInline: vars.size.space[200],
            },
        },
        variant: {
            line: {
                vars: {
                    [buttonHorizontalBorderRadius]: `${vars.size.borderRadius[300]} ${vars.size.borderRadius[300]} 0 0`,
                    [buttonVerticalBorderRadius]: `${vars.size.borderRadius[300]} 0 0 ${vars.size.borderRadius[300]}`,
                },
            },
            fill: {
                vars: {
                    [buttonHorizontalBorderRadius]: vars.size.borderRadius[300],
                    [buttonVerticalBorderRadius]: vars.size.borderRadius[300],
                },
                selectors: {
                    '&[data-active]': {
                        color: vars.color.foreground.primary['100'],
                    },
                },
            },
        },
    },
});

export const indicator = componentRecipe({
    base: {
        position: 'absolute',
        transitionDuration: '100ms',
        transitionTimingFunction: 'ease-in-out',
        zIndex: 0,
    },

    defaultVariants: { orientation: 'horizontal', variant: 'line' },
    variants: {
        orientation: {
            horizontal: {
                left: 0,
                bottom: indicatorBottomPosition,
                transform: `translateX(var(${EXTERNAL_VARS.activeTabLeft}))`,
                width: `var(${EXTERNAL_VARS.activeTabWidth})`,
                height: indicatorHorizontalHeight,
                transitionProperty: 'transform, width',
            },
            vertical: {
                top: 0,
                right: indicatorRightPosition,
                transform: `translateY(var(${EXTERNAL_VARS.activeTabTop}))`,
                height: `var(${EXTERNAL_VARS.activeTabHeight})`,
                width: indicatorVerticalWidth,
                transitionProperty: 'transform, height',
            },
        },
        variant: {
            line: {
                backgroundColor: vars.color.border.primary,
                vars: {
                    [indicatorBottomPosition]: `-${BORDER_WIDTH}`,
                    [indicatorRightPosition]: `-${BORDER_WIDTH}`,
                    [indicatorHorizontalHeight]: `${BORDER_WIDTH}`,
                    [indicatorVerticalWidth]: `${BORDER_WIDTH}`,
                },
            },
            fill: {
                backgroundColor: vars.color.background.primary['100'],
                borderRadius: vars.size.borderRadius[300],
                vars: {
                    [indicatorBottomPosition]: '0',
                    [indicatorRightPosition]: '0',
                    [indicatorHorizontalHeight]: '100%',
                    [indicatorVerticalWidth]: `100%`,
                },
            },
        },
    },
});

export type ListVariants = NonNullable<RecipeVariants<typeof list>>;
export type ButtonVariants = NonNullable<RecipeVariants<typeof button>>;
