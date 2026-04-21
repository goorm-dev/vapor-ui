import { calc } from '@vanilla-extract/css-utils';
import type { RecipeVariants } from '@vanilla-extract/recipes';

import { componentRecipe, componentStyle } from '~/styles/mixins/layer-style.css';
import { vars } from '~/styles/themes.css';

export const overlay = componentStyle({
    position: 'fixed',

    inset: 0,

    transition: 'opacity 0.15s cubic-bezier(.45,1.005,0,1.005)',

    opacity: 0.32,
    backgroundColor: vars.color.black, // TODO: Use constant z-index value

    selectors: {
        '&[data-starting-style], &[data-ending-style]': {
            opacity: 0,
        },
    },
});

const SPACING = '2rem';

export const popup = componentRecipe({
    base: {
        position: 'fixed',

        top: '50%',
        left: '50%',

        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',

        transform: 'translate(-50%,-50%)',
        transitionDuration: '0.15s',

        transitionProperty: 'transform, opacity',
        borderRadius: vars.size.borderRadius[300],
        boxShadow: '0 1rem 2rem 0 rgba(0, 0, 0, 0.2)',

        backgroundColor: vars.color.background.overlay[100],
        maxWidth: calc.subtract('100vw', calc.multiply(SPACING, 2)),
        maxHeight: '80vh', // TODO: Use constant z-index value

        '@supports': {
            '(max-width: 100svw)': { maxWidth: calc.subtract('100svw', calc.multiply(SPACING, 2)) },
            '(max-height: 80svh)': { maxHeight: '80svh' },
        },

        selectors: {
            '&[data-starting-style], &[data-ending-style]': {
                transform: 'translate(-50%, -50%) scale(0.9)',
                opacity: 0,
            },
        },
    },

    defaultVariants: { size: 'md' },
    variants: {
        /**
         * Width of the dialog popup. Default: `'md'`
         */
        size: {
            md: { width: '31.25rem' },
            lg: { width: '50rem' },
            xl: { width: '71.25rem' },
        },
    },
});

export const title = componentStyle({
    lineHeight: vars.typography.lineHeight['200'],
    letterSpacing: vars.typography.letterSpacing['100'],
    color: vars.color.foreground.normal[200],
    fontSize: vars.typography.fontSize['200'],
    fontWeight: vars.typography.fontWeight['700'],
});

export const description = componentStyle({
    lineHeight: vars.typography.lineHeight['075'],
    letterSpacing: vars.typography.letterSpacing['100'],
    color: vars.color.foreground.normal[200],
    fontSize: vars.typography.fontSize['075'],
    fontWeight: vars.typography.fontWeight['400'],
});

export const header = componentStyle({
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
    gap: vars.size.space['150'],
    paddingBlock: 0,
    paddingInline: vars.size.space['300'],
    width: '100%',
    height: vars.size.dimension['700'],
});

export const body = componentStyle({
    paddingBlock: 0,
    paddingInline: vars.size.space['300'],
    width: '100%',
    overflowY: 'auto',
});

export const footer = componentStyle({
    display: 'flex',
    alignItems: 'center',
    paddingBlock: vars.size.space['200'],
    paddingInline: vars.size.space['300'],
    width: '100%',
});

export type DialogPopupVariants = NonNullable<RecipeVariants<typeof popup>>;
