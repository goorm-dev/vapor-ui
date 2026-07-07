import { createGlobalVar } from '@vanilla-extract/css';

import { componentStyle } from '~/styles/mixins/layer-style.css';
import { vars } from '~/styles/themes.css';

const easing = createGlobalVar('easing');
const animationDuration = createGlobalVar('animation-duration');

export const positioner = componentStyle({
    bottom: `calc(env(safe-area-inset-bottom) + ${vars.size.space['250']})`,

    transitionDuration: animationDuration,
    transitionProperty: 'top, left, right, bottom, transform',
    transitionTimingFunction: easing,

    vars: {
        [animationDuration]: '0.35s',
        [easing]: 'cubic-bezier(0.22, 1, 0.36, 1)',
    },
});

export const popup = componentStyle({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: vars.size.space['200'],

    transformOrigin: 'var(--transform-origin)',
    transitionDuration: animationDuration,

    transitionProperty: 'opacity, transform',
    transitionTimingFunction: easing,
    border: '0.0625rem solid',
    borderRadius: vars.size.borderRadius[300],

    borderColor: vars.color.border.normal,

    boxShadow: vars.shadow.lg,
    backgroundColor: vars.color.background.overlay[100],
    paddingBlock: vars.size.space['150'],
    paddingInline: vars.size.space['200'],

    selectors: {
        '&[data-starting-style], &[data-ending-style]': {
            transform: `translateY(100%)`,
            opacity: 0,
        },
    },
});
