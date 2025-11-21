import { createGlobalVar } from '@vanilla-extract/css';

import { layerStyle } from '~/styles/mixins/layer-style.css';
import { vars } from '~/styles/themes.css';

const easing = createGlobalVar('easing');
const animationDuration = createGlobalVar('animation-duration');

export const positioner = layerStyle('components', {
    bottom: `calc(env(safe-area-inset-bottom) + ${vars.size.space['250']})`,

    transitionProperty: 'top, left, right, bottom, transform',
    transitionTimingFunction: easing,
    transitionDuration: animationDuration,

    vars: {
        [easing]: 'cubic-bezier(0.22, 1, 0.36, 1)',
        [animationDuration]: '0.35s',
    },
});

export const popup = layerStyle('components', {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: vars.size.space['200'],

    paddingBlock: vars.size.space['150'],
    paddingInline: vars.size.space['200'],

    borderRadius: vars.size.borderRadius[300],
    border: `1px solid ${vars.color.border.normal}`,
    backgroundColor: vars.color.background.overlay[100],

    boxShadow: vars.shadow.lg,

    transitionProperty: 'opacity, transform',
    transitionTimingFunction: easing,
    transitionDuration: animationDuration,
    transformOrigin: 'var(--transform-origin)',

    selectors: {
        '&[data-starting-style], &[data-ending-style]': {
            transform: `translateY(100%)`,
            opacity: 0,
        },
    },
});
