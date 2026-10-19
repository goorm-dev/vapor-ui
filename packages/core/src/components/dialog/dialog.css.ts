import { calc } from '@vanilla-extract/css-utils';
import type { RecipeVariants } from '@vanilla-extract/recipes';

import { foregrounds } from '~/styles/mixins/foreground.css';
import { componentRecipe, componentStyle } from '~/styles/mixins/layer-style.css';
import { typography } from '~/styles/mixins/typography.css';
import { vars } from '~/styles/themes.css';

export const overlay = componentStyle({
    position: 'fixed',

    inset: 0,

    transition: 'opacity 0.15s cubic-bezier(.45,1.005,0,1.005)',

    opacity: 0.32,
    backgroundColor: vars.color.background['canvas-dim'],

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

        backgroundColor: vars.color.background['canvas-overlay'],
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

export const title = componentStyle([
    foregrounds({ color: 'normal' }),
    typography({ style: 'heading5' }),
]);

export const description = componentStyle([
    foregrounds({ color: 'hint' }),
    typography({ style: 'subtitle1' }),
]);

export const header = componentStyle({
    display: 'flex',
    flexShrink: 0,
    alignItems: 'center',
    gap: vars.size.space['250'],
    paddingTop: vars.size.space['300'],
    paddingBottom: 0,
    paddingInline: vars.size.space['300'],
    width: '100%',
});

export const body = componentStyle({
    marginTop: vars.size.space['250'],
    paddingBottom: 0,
    paddingInline: vars.size.space['300'],
    width: '100%',
    overflowY: 'auto',
});

export const footer = componentStyle({
    display: 'flex',
    alignItems: 'center',
    paddingTop: vars.size.space['250'],
    paddingBottom: vars.size.space['300'],
    paddingInline: vars.size.space['300'],
    width: '100%',
});

export type DialogPopupVariants = NonNullable<RecipeVariants<typeof popup>>;
