import { keyframes } from '@vanilla-extract/css';
import type { RecipeVariants } from '@vanilla-extract/recipes';
import { recipe } from '@vanilla-extract/recipes';

import { layerStyle } from '~/styles/utils/layer-style.css';
import { vars } from '~/styles/vars.css';

const fadeIn = keyframes({
    '0%': { opacity: 0 },
    '100%': { opacity: 0.32 },
});

const fadeOut = keyframes({
    '0%': { opacity: 0.32 },
    '100%': { opacity: 0 },
});

export const overlay = layerStyle('vapor-component', {
    position: 'fixed',
    inset: 0,
    transition: 'opacity 0.2s cubic-bezier(0.175,0.885,0.32,1.1)',
    backgroundColor: vars.color['black'],

    selectors: {
        "&[data-state='open']": { animation: `${fadeIn} 0.2s ease-out forwards` },
        "&[data-state='closed']": { animation: `${fadeOut} 0.2s ease-out forwards` },
    },
});

export const scaleUp = keyframes({
    '0%': { transform: 'translate(-50%, -50%) scale(0.96)', opacity: 0 },
    '100%': { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
});

export const scaleDown = keyframes({
    '0%': { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
    '100%': { transform: 'translate(-50%, -50%) scale(0.96)', opacity: 0 },
});

export const content = recipe({
    base: layerStyle('vapor-component', {
        position: 'fixed',
        top: '50%',
        left: '50%',

        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',

        borderRadius: vars.size.borderRadius[300],

        boxShadow: '0 1rem 2rem 0 rgba(0, 0, 0, 0.2)',
        backgroundColor: vars.color.background['normal-lighter'],

        selectors: {
            "&[data-state='open']": {
                animation: `${scaleUp} 0.2s cubic-bezier(0.175,0.885,0.32,1.1) forwards`,
            },
            "&[data-state='closed']": {
                animation: `${scaleDown} 0.2s cubic-bezier(0.175,0.885,0.32,1.1) forwards`,
            },
        },
    }),

    defaultVariants: { size: 'md' },
    variants: {
        size: {
            md: layerStyle('vapor-component', { width: '31.25rem' }),
            lg: layerStyle('vapor-component', { width: '50rem' }),
            xl: layerStyle('vapor-component', { width: '71.25rem' }),
        },
    },
});

export type DialogContentVariants = NonNullable<RecipeVariants<typeof content>>;

export const title = layerStyle('vapor-component', {
    lineHeight: vars.typography.lineHeight['200'],
    letterSpacing: vars.typography.letterSpacing['100'],
    color: vars.color.foreground['normal'],
    fontSize: vars.typography.fontSize['200'],
    fontWeight: vars.typography.fontWeight['700'],
});

export const description = layerStyle('vapor-component', {
    lineHeight: vars.typography.lineHeight['075'],
    letterSpacing: vars.typography.letterSpacing['100'],
    color: vars.color.foreground['normal'],
    fontSize: vars.typography.fontSize['075'],
    fontWeight: vars.typography.fontWeight['400'],
});

export const header = layerStyle('vapor-component', {
    display: 'flex',
    alignItems: 'center',
    gap: vars.size.space['150'],
    paddingBlock: 0,
    paddingInline: vars.size.space['300'],
    width: '100%',
    height: vars.size.dimension['700'],
});

export const body = layerStyle('vapor-component', {
    paddingBlock: 0,
    paddingInline: vars.size.space['300'],
    width: '100%',
    overflowY: 'auto',
});

export const footer = layerStyle('vapor-component', {
    display: 'flex',
    alignItems: 'center',
    paddingBlock: vars.size.space['200'],
    paddingInline: vars.size.space['300'],
    width: '100%',
});
