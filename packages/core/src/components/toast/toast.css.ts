import { createGlobalVar, fallbackVar } from '@vanilla-extract/css';
import { calc } from '@vanilla-extract/css-utils';
import { recipe } from '@vanilla-extract/recipes';

import { foregrounds } from '~/styles/mixins/foreground.css';
import { layerStyle } from '~/styles/mixins/layer-style.css';
import { typography } from '~/styles/mixins/typography.css';
import { vars } from '~/styles/themes.css';

export const inners = {
    gap: createGlobalVar('gap'),
    peek: createGlobalVar('peek'),
    scale: createGlobalVar('scale'),
    shrink: createGlobalVar('shrink'),
    height: createGlobalVar('height'),
    offsetY: createGlobalVar('offset-y'),
};

const outers = {
    index: 'var(--toast-index)',
    frontmostHeight: 'var(--toast-frontmost-height)',
    height: 'var(--toast-height)',
    swipeMoveX: 'var(--toast-swipe-movement-x)',
    swipeMoveY: 'var(--toast-swipe-movement-y)',
    offsetY: 'var(--toast-offset-y)',
};

export const viewport = layerStyle('components', {
    position: 'fixed',
    zIndex: 1,
    top: '1rem',
    right: '1rem',
    bottom: 'auto',
    left: 'auto',

    margin: '0 auto',

    maxWidth: '100vw',

    '@media': {
        '(min-width: 600px)': {
            top: '1.5rem',
            right: '1.5rem',
        },
    },
});

export const root = recipe({
    base: layerStyle('components', {
        position: 'absolute',
        zIndex: calc.subtract('1000', outers.index),
        top: 0,
        right: 0,
        bottom: 'auto',
        left: 'auto',

        transform: `translateX(${outers.swipeMoveX}) translateY(calc(${outers.swipeMoveY} + (${outers.index} * ${inners.peek}) + (${inners.shrink} * ${inners.height}))) scale(${inners.scale})`,
        transformOrigin: 'top center',
        transition: 'transform 400ms, opacity 400ms, height 200ms, box-shadow 200ms',

        borderRadius: vars.size.borderRadius[300],
        boxShadow: vars.shadow.md,
        backgroundClip: 'padding-box',
        padding: vars.size.space[200],
        width: 'max-content',
        maxWidth: '500px',
        height: inners.height,

        userSelect: 'none',

        vars: {
            [inners.gap]: '0.75rem',
            [inners.peek]: '0.5rem',
            [inners.scale]: `calc(max(0, 1 - (${outers.index} * 0.05)))`,
            [inners.shrink]: calc.subtract('1', inners.scale),
            [inners.height]: fallbackVar(outers.frontmostHeight, outers.height),
            [inners.offsetY]: calc.add(
                outers.offsetY,
                calc.multiply(outers.index, inners.gap),
                outers.swipeMoveY,
            ),
        },

        selectors: {
            '&[data-expanded]': {
                transform: `translateX(${outers.swipeMoveX}) translateY(${inners.offsetY})`,
                height: outers.height,
            },

            '&[data-starting-style], &[data-ending-style]': {
                transform: 'translateY(-150%)',
                opacity: 0,
            },

            '&[data-limited]': {
                opacity: 0,
            },

            '&[data-ending-style][data-swipe-direction="up"]': {
                transform: `translateY(calc(${outers.swipeMoveY} - 150%))`,
            },
            '&[data-ending-style][data-swipe-direction="right"]': {
                transform: `translateX(${calc.add(outers.swipeMoveX, '150%')}) translateY(${inners.offsetY})`,
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
    }),

    defaultVariants: { colorPalette: 'info' },
    variants: {
        colorPalette: {
            danger: layerStyle('components', {
                backgroundColor: vars.color.background.danger[200],
            }),
            success: layerStyle('components', {
                backgroundColor: vars.color.background.success[200],
            }),
            info: layerStyle('components', {
                backgroundColor: vars.color.background.contrast[200],
            }),
        },
    },
});

export const content = layerStyle('components', {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: vars.size.space[400],

    transition: 'opacity 400ms',

    selectors: {
        '&[data-behind]': { opacity: 0 },
        '&[data-expanded]': { opacity: 1 },
    },
});

export const title = [foregrounds({ color: 'white' }), typography({ style: 'subtitle1' })];
export const description = [foregrounds({ color: 'white' }), typography({ style: 'body2' })];
