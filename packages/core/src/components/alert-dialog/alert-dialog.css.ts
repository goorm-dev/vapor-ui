import { calc } from '@vanilla-extract/css-utils';

import { foregrounds } from '~/styles/mixins/foreground.css';
import { componentStyle } from '~/styles/mixins/layer-style.css';
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
    width: '31.25rem',
    minWidth: 'min-content',
    maxWidth: calc.subtract('100vw', calc.multiply(SPACING, 2)),
    maxHeight: '80vh',

    '@supports': {
        '(max-height: 80svh)': { maxHeight: '80svh' },
    },

    selectors: {
        '&[data-starting-style], &[data-ending-style]': {
            transform: 'translate(-50%, -50%) scale(0.9)',
            opacity: 0,
        },
    },
});

export const title = componentStyle([
    typography({ style: 'heading5' }),
    foregrounds({ color: 'normal' }),
]);

export const description = componentStyle([
    typography({ style: 'subtitle1' }),
    foregrounds({ color: 'hint' }),
]);

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
    gap: vars.size.space[100],
    padding: vars.size.space['300'],
    width: '100%',
});
