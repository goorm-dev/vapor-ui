import type { CSSProperties } from '@vanilla-extract/css';
import { createGlobalVar, style } from '@vanilla-extract/css';

import { vars } from '~/styles/vars.css';

export const overlay = style({
    position: 'fixed',
    zIndex: 50, // TODO: Use constant z-index value
    inset: 0,

    transition: 'opacity 0.15s cubic-bezier(.45,1.005,0,1.005)',

    backdropFilter: 'blur(1.5px)',
    backgroundColor: 'rgba(0, 0, 0, 32%)',

    selectors: {
        '&[data-starting-style], &[data-ending-style]': {
            opacity: 0,
        },
    },
});

const transformVar = createGlobalVar('transform', { inherits: false, syntax: '*' });

const verticalStyle = { width: '100%', height: '80svh' };
const horizontalStyle = { width: '18.75rem', height: '100%' };

const sideConfig = {
    top: {
        top: 0,
        left: 0,
        ...verticalStyle,
        vars: { [transformVar]: 'translateY(-100%)' },
    },
    bottom: {
        left: 0,
        bottom: 0,
        ...verticalStyle,
        vars: { [transformVar]: 'translateY(100%)' },
    },
    right: {
        top: 0,
        right: 0,
        ...horizontalStyle,
        vars: { [transformVar]: 'translateX(100%)' },
    },
    left: {
        top: 0,
        left: 0,
        ...horizontalStyle,
        vars: { [transformVar]: 'translateX(-100%)' },
    },
};

const sideSelectors = Object.entries(sideConfig).reduce(
    (acc, [side, config]) => {
        acc[`&[data-side="${side}"]`] = {
            ...config,
        };
        return acc;
    },
    {} as Record<string, CSSProperties>,
);

export const content = style({
    position: 'fixed',
    zIndex: 50, // TODO: Use constant z-index value

    display: 'flex',
    flexDirection: 'column',

    gap: vars.size.space[200],

    transform: 'unset',
    transformOrigin: 'top center',

    transition: 'unset',
    transitionDuration: '.6s, .3s',
    transitionProperty: 'transform, filter',
    transitionTimingFunction: 'cubic-bezier(.45,1.005,0,1.005)',

    borderRadius: 0,
    boxShadow: '0 1rem 2rem 0 rgba(0, 0, 0, 0.2)',
    backgroundColor: vars.color.background['normal-lighter'],

    paddingTop: vars.size.space[250],
    paddingBottom: vars.size.space[100],
    paddingInline: vars.size.space[150],

    width: '18.75rem',
    height: '100%',

    selectors: {
        ...sideSelectors,

        '&[data-starting-style], &[data-ending-style]': {
            transform: transformVar,
        },

        '&[data-ending-style]': {
            transitionDelay: '0ms, 125ms',
            transitionDuration: '250ms',
            transitionTimingFunction: 'cubic-bezier(.375,.015,.545,.455)',
        },
    },
});

export const header = style({
    padding: 'unset',
    height: 'unset',
});

export const body = style({
    flex: 1,
    padding: 'unset',
    maxHeight: 'unset',
});

export const footer = style({
    padding: 'unset',
});
