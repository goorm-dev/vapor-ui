import { calc } from '@vanilla-extract/css-utils';

import { componentStyle } from '~/styles/mixins/layer-style.css';
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

export const popup = componentStyle({
    position: 'fixed',

    top: '50%',
    left: '50%',

    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',

    transform: 'translate(-50%,-50%)',
    transitionDuration: '0.15s',

    transitionProperty: 'transform, opacity',
    borderRadius: vars.size.borderRadius[400],
    boxShadow: vars.shadow.xl,

    backgroundColor: vars.color.background['canvas-overlay'],
    maxWidth: calc.subtract('100vw', calc.multiply(SPACING, 2)),
    maxHeight: '80vh',

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
});

export const title = componentStyle({
    lineHeight: vars.typography.lineHeight['200'],
    letterSpacing: vars.typography.letterSpacing['100'],
    color: vars.color.foreground['normal'],
    fontSize: vars.typography.fontSize['200'],
    fontWeight: vars.typography.fontWeight['700'],
});

export const description = componentStyle({
    lineHeight: vars.typography.lineHeight['075'],
    letterSpacing: vars.typography.letterSpacing['100'],
    color: vars.color.foreground['normal'],
    fontSize: vars.typography.fontSize['075'],
    fontWeight: vars.typography.fontWeight['400'],
});

export const body = componentStyle({
    paddingTop: vars.size.space[400],
    paddingBottom: 0,
    paddingInline: vars.size.space['300'],
    width: '100%',
    overflowY: 'auto',
});

export const footer = componentStyle({
    display: 'flex',
    alignItems: 'center',
    padding: vars.size.space['300'],
    width: '100%',
});
