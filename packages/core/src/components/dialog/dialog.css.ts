import { keyframes, style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

import { vars } from '~/styles/contract.css';

const fadeIn = keyframes({
    '0%': { opacity: 0 },
    '100%': { opacity: 0.32 },
});

const fadeOut = keyframes({
    '0%': { opacity: 0.32 },
    '100%': { opacity: 0 },
});

export const overlay = style({
    position: 'fixed',
    inset: 0,
    transition: 'opacity 0.2s ease-out',
    backgroundColor: vars.color['black'],

    selectors: {
        "&[data-state='open']": { animation: `${fadeIn} 0.2s ease-out forwards` },
        "&[data-state='closed']": { animation: `${fadeOut} 0.2s ease-out forwards` },
    },
});

export const slideUp = keyframes({
    '0%': { transform: 'translate(-50%, -50%)', opacity: 0 },
    '100%': { transform: 'translate(-50%, -55%)', opacity: 1 },
});

export const slideDown = keyframes({
    '0%': { transform: 'translate(-50%, -55%)', opacity: 1 },
    '100%': { transform: 'translate(-50%, -50%)', opacity: 0 },
});

export const content = recipe({
    base: {
        position: 'fixed',
        top: '50%',
        left: '50%',

        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',

        transform: 'translate(-50%, -50%)',
        opacity: 0,
        borderRadius: vars.size.borderRadius[300],

        boxShadow: '0 1rem 2rem 0 rgba(0, 0, 0, 0.2)',
        backgroundColor: vars.color.background['normal-lighter'],

        selectors: {
            "&[data-state='open']": {
                animation: `${slideUp} 0.2s ease-out forwards`,
                animationDelay: '0.05s',
            },
            "&[data-state='closed']": {
                animation: `${slideDown} 0.2s ease-out forwards`,
            },
        },
    },

    defaultVariants: { size: 'md' },
    variants: {
        size: {
            md: { width: '31.25rem' },
            lg: { width: '50rem' },
            xl: { width: '71.25rem' },
        },
    },
});

export const title = style({
    lineHeight: vars.typography.lineHeight['200'],
    letterSpacing: vars.typography.letterSpacing['100'],
    color: vars.color.foreground['normal'],
    fontSize: vars.typography.fontSize['200'],
    fontWeight: vars.typography.fontWeight['700'],
});

export const description = style({
    lineHeight: vars.typography.lineHeight['075'],
    letterSpacing: vars.typography.letterSpacing['100'],
    color: vars.color.foreground['normal'],
    fontSize: vars.typography.fontSize['075'],
    fontWeight: vars.typography.fontWeight['400'],
});

export const header = style({
    display: 'flex',
    alignItems: 'center',
    gap: vars.size.space['150'],
    paddingBlock: 0,
    paddingInline: vars.size.space['300'],
    width: '100%',
    height: vars.size.dimension['700'],
});

export const body = style({
    paddingBlock: 0,
    paddingInline: vars.size.space['300'],
    width: '100%',
    overflowY: 'auto',
});

export const footer = style({
    display: 'flex',
    alignItems: 'center',
    paddingBlock: vars.size.space['200'],
    paddingInline: vars.size.space['300'],
    width: '100%',
});
