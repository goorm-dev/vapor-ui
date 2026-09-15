import { createGlobalVar } from '@vanilla-extract/css';
import { calc } from '@vanilla-extract/css-utils';
import type { RecipeVariants } from '@vanilla-extract/recipes';

import { componentRecipe, componentStyle } from '~/styles/mixins/layer-style.css';
import { typography } from '~/styles/mixins/typography.css';
import { vars } from '~/styles/themes.css';

export const inners = {
    gap: createGlobalVar('gap'),
    offsetY: createGlobalVar('offset-y'),
};

const outers = {
    index: 'var(--toast-index)',
    height: 'var(--toast-height)',
    swipeMoveX: 'var(--toast-swipe-movement-x)',
    swipeMoveY: 'var(--toast-swipe-movement-y)',
    offsetY: 'var(--toast-offset-y)',
};

const slideTransform = (translateX: string) =>
    `translateX(${translateX}) translateY(${inners.offsetY})`;

const OFF_SCREEN_X = '28rem';

export const viewport = componentStyle({
    position: 'fixed',
    zIndex: 1,
    top: '1rem',
    right: '1rem',
    bottom: 'auto',
    left: 'auto',

    margin: '0 auto',
    width: '25rem',
    maxWidth: calc.subtract('100vw', calc.multiply('1rem', 2)),

    '@media': {
        '(min-width: 600px)': {
            top: '1.5rem',
            right: '1.5rem',
            maxWidth: calc.subtract('100vw', calc.multiply('1.5rem', 2)),
        },
    },
});

export const root = componentRecipe({
    base: {
        position: 'absolute',
        zIndex: calc.subtract('1000', outers.index),
        top: 0,
        right: 0,
        bottom: 'auto',
        left: 'auto',

        transform: slideTransform(outers.swipeMoveX),
        transition: 'transform 400ms, opacity 400ms, height 200ms, box-shadow 200ms',

        borderRadius: vars.size.borderRadius[300],
        boxShadow: vars.shadow.md,
        backgroundClip: 'padding-box',
        padding: vars.size.space[200],
        width: '100%',
        height: outers.height,

        userSelect: 'none',

        '@media': {
            '(prefers-reduced-motion: reduce)': {
                transition: 'none',
            },
        },

        vars: {
            [inners.gap]: vars.size.space[200],
            [inners.offsetY]: calc.add(
                outers.offsetY,
                calc.multiply(outers.index, inners.gap),
                outers.swipeMoveY,
            ),
        },

        selectors: {
            '&[data-starting-style], &[data-ending-style]': {
                transform: slideTransform(OFF_SCREEN_X),
                opacity: 0,
            },

            '&[data-limited]': {
                opacity: 0,
            },

            '&[data-ending-style][data-swipe-direction="up"]': {
                transform: `translateY(calc(${outers.swipeMoveY} - 150%))`,
            },
            '&[data-ending-style][data-swipe-direction="down"]': {
                transform: `translateY(calc(${outers.swipeMoveY} + 150%))`,
            },
            '&[data-ending-style][data-swipe-direction="right"]': {
                transform: slideTransform(calc.add(outers.swipeMoveX, OFF_SCREEN_X)),
            },
            '&[data-ending-style][data-swipe-direction="left"]': {
                transform: slideTransform(calc.subtract(outers.swipeMoveX, OFF_SCREEN_X)),
            },

            '&::after': {
                position: 'absolute',
                top: '100%',
                left: 0,
                width: '100%',
                height: calc.add(inners.gap, '1px'),
                content: '""',
            },
        },
    },

    defaultVariants: { colorPalette: 'info' },
    variants: {
        colorPalette: {
            danger: {
                backgroundColor: vars.color.background['danger'],
                color: vars.color.foreground.staticWhite,
            },
            success: {
                backgroundColor: vars.color.background['success'],
                color: vars.color.foreground.staticWhite,
            },
            info: {
                backgroundColor: vars.color.background['canvas-inverse'],
                color: vars.color.foreground.inverse,
            },
        },
    },
});

export const content = componentStyle({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: vars.size.space[400],
});

export const title = componentStyle([{ color: 'inherit' }, typography({ style: 'subtitle1' })]);

export const description = componentStyle([{ color: 'inherit' }, typography({ style: 'body2' })]);

export type RootVariants = NonNullable<RecipeVariants<typeof root>>;
