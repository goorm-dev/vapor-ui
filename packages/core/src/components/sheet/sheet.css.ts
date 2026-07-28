import type { CSSProperties } from '@vanilla-extract/css';
import { createGlobalVar } from '@vanilla-extract/css';

import { interaction } from '~/styles/mixins/interactions.css';
import { componentStyle } from '~/styles/mixins/layer-style.css';
import { when } from '~/styles/mixins/logical-states';
import { vars } from '~/styles/themes.css';

export const overlay = componentStyle({
    position: 'fixed',
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

// Default resize bounds. ResizeHandle reads the computed min/max of the resized axis
// (browsers resolve these to px), so consumer CSS overriding them re-bounds the drag.
// The min keeps the sheet grabbable; the max stops it at the viewport edge.
const verticalStyle = {
    width: '100%',
    height: '80svh',
    minHeight: vars.size.dimension[800],
    maxHeight: '100dvh',
};
const horizontalStyle = {
    width: '18.75rem',
    height: '100%',
    minWidth: vars.size.dimension[800],
    maxWidth: '100dvw',
};

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

export const popup = componentStyle({
    position: 'fixed',

    display: 'flex',
    flexDirection: 'column',

    transform: 'unset',
    transformOrigin: 'top center',

    transition: 'unset',
    transitionDuration: '.6s, .3s',
    transitionProperty: 'transform, filter',
    transitionTimingFunction: 'cubic-bezier(.45,1.005,0,1.005)',

    borderRadius: 0,
    boxShadow: '0 1rem 2rem 0 rgba(0, 0, 0, 0.2)',
    backgroundColor: vars.color.background.overlay[100],

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

// Drag-only strip on the sheet's inner edge (toward the viewport center) based on
// data-side. Mouse users can start a drag anywhere on it; it takes no keyboard focus
// and no interaction feedback — both live on the grip inside. Pointer tracking writes
// width/height directly for 1:1 direct manipulation (no transition).
export const resizeHandle = componentStyle({
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    touchAction: 'none',

    selectors: {
        // Vertical sheets (left/right) → col-resize, full height.
        '&[data-side="left"], &[data-side="right"]': {
            top: 0,
            bottom: 0,
            width: vars.size.dimension[300],
            cursor: 'col-resize',
        },
        // Horizontal sheets (top/bottom) → row-resize, full width.
        '&[data-side="top"], &[data-side="bottom"]': {
            left: 0,
            right: 0,
            height: vars.size.dimension[300],
            cursor: 'row-resize',
        },
        // Inner edge placement: handle sits on the side facing the viewport center.
        // The grip bar's thin axis pins to the sheet's exposed edge (the drag boundary),
        // while its long axis stays centered.
        '&[data-side="right"]': { left: 0, justifyContent: 'flex-start' },
        '&[data-side="left"]': { right: 0, justifyContent: 'flex-end' },
        '&[data-side="bottom"]': { top: 0, alignItems: 'flex-start' },
        '&[data-side="top"]': { bottom: 0, alignItems: 'flex-end' },

        [when.disabled()]: {
            cursor: 'default',
            pointerEvents: 'none',
        },
    },
});

// Keyboard/affordance grip: the focusable slider AND the visible handle bar in one.
// A 4x48px pill (48x4 for top/bottom) centered on the strip; interaction()'s hover/active
// tint and focus ring land directly on the bar. Matches Figma node 45368-23896.
export const resizeHandleGrip = componentStyle([
    interaction(),
    {
        backgroundColor: vars.color.foreground.hint[100],
        borderRadius: vars.size.borderRadius[300],

        selectors: {
            '&[data-side="left"], &[data-side="right"]': {
                width: vars.size.dimension['050'],
                height: vars.size.dimension[600],
            },
            '&[data-side="top"], &[data-side="bottom"]': {
                width: vars.size.dimension[600],
                height: vars.size.dimension['050'],
            },
            // Same disabled treatment as Button: dim + block pointer.
            [when.disabled()]: { opacity: 0.32, pointerEvents: 'none' },
        },
    },
]);

export const header = componentStyle({
    paddingTop: vars.size.space[250],
    paddingBottom: vars.size.space[100],
    paddingInline: vars.size.space[150],
    height: 'unset',
});

export const body = componentStyle({
    flex: 1,
    paddingBlock: vars.size.space[100],
    paddingInline: vars.size.space[150],
    height: '100%',
    maxHeight: 'unset',
});

export const footer = componentStyle({
    paddingBlock: vars.size.space[100],
    paddingInline: vars.size.space[150],
});
