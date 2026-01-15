import { createGlobalVar } from '@vanilla-extract/css';

import { layerStyle } from '~/styles/mixins/layer-style.css';
import { vars } from '~/styles/themes.css';

const easing = createGlobalVar('easing');
const animationDuration = createGlobalVar('animation-duration');

export const positioner = layerStyle('components', {
    position: 'relative',
    zIndex: vars.stacking.overlay,

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

    border: '0.0625rem solid',
    borderColor: vars.color.border.normal,
    borderRadius: vars.size.borderRadius[300],
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
