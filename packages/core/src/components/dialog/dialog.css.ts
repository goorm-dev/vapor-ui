import type { RecipeVariants } from '@vanilla-extract/recipes';
import { recipe } from '@vanilla-extract/recipes';

import { layerStyle } from '~/styles/mixins/layer-style.css';
import { vars } from '~/styles/themes.css';

export const overlay = layerStyle('components', {
    position: 'fixed',
    zIndex: 50,
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

export const popup = recipe({
    base: layerStyle('components', {
        position: 'fixed',
        top: '50%',
        left: '50%',
        zIndex: 50,

        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',

        transform: 'translate(-50%,-50%)',
        transition: 'all 0.15s',

        borderRadius: vars.size.borderRadius[300],
        boxShadow: '0 1rem 2rem 0 rgba(0, 0, 0, 0.2)',
        backgroundColor: vars.color.background.overlay[100], // TODO: Use constant z-index value

        selectors: {
            '&[data-starting-style], &[data-ending-style]': {
                transform: 'translate(-50%, -50%) scale(0.9)',
                opacity: 0,
            },
        },
    }),

    defaultVariants: { size: 'md' },
    variants: {
        /**
         * 다이얼로그 크기
         * @default 'md'
         */
        size: {
            md: layerStyle('components', { width: '31.25rem' }),
            lg: layerStyle('components', { width: '50rem' }),
            xl: layerStyle('components', { width: '71.25rem' }),
        },
    },
});

export const title = layerStyle('components', {
    lineHeight: vars.typography.lineHeight['200'],
    letterSpacing: vars.typography.letterSpacing['100'],
    color: vars.color.foreground.normal[200],
    fontSize: vars.typography.fontSize['200'],
    fontWeight: vars.typography.fontWeight['700'],
});

export const description = layerStyle('components', {
    lineHeight: vars.typography.lineHeight['075'],
    letterSpacing: vars.typography.letterSpacing['100'],
    color: vars.color.foreground.normal[200],
    fontSize: vars.typography.fontSize['075'],
    fontWeight: vars.typography.fontWeight['400'],
});

export const header = layerStyle('components', {
    display: 'flex',
    alignItems: 'center',
    gap: vars.size.space['150'],
    paddingBlock: 0,
    paddingInline: vars.size.space['300'],
    width: '100%',
    height: vars.size.dimension['700'],
});

export const body = layerStyle('components', {
    paddingBlock: 0,
    paddingInline: vars.size.space['300'],
    width: '100%',
    '@supports': {
        '(max-height: 80svh)': {
            maxHeight: '80svh',
        },
    },
    maxHeight: '80vh',
    overflowY: 'auto',
});

export const footer = layerStyle('components', {
    display: 'flex',
    alignItems: 'center',
    paddingBlock: vars.size.space['200'],
    paddingInline: vars.size.space['300'],
    width: '100%',
});

export type DialogPopupVariants = NonNullable<RecipeVariants<typeof popup>>;
