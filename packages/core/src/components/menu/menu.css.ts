import { style } from '@vanilla-extract/css';

import { foregrounds } from '~/styles/mixins/foreground.css';
import { interaction } from '~/styles/mixins/interactions.css';
import { layerStyle } from '~/styles/mixins/layer-style.css';
import { typography } from '~/styles/mixins/typography.css';
import { vars } from '~/styles/themes.css';

export const positioner = layerStyle('components', {
    position: 'relative',
    zIndex: 50, // TODO: move to vars
});

export const popup = layerStyle('components', {
    display: 'flex',
    flexDirection: 'column',

    transformOrigin: 'var(--transform-origin)',
    transition: 'transform 150ms, opacity 150ms',

    border: `0.0625rem solid ${vars.color.border.normal}`,
    borderRadius: vars.size.borderRadius['300'],
    boxShadow: vars.shadow.md,

    backgroundColor: vars.color.background.overlay[100],
    padding: vars.size.space['050'],
    minWidth: 'max(var(--anchor-width), 12.5rem)',

    overflowY: 'auto',

    ':focus-visible': { outline: 'none' },

    selectors: {
        '&[data-starting-style], &[data-ending-style]': {
            transform: 'scale(0.95)',
            opacity: 0,
        },
    },
});

export const subPopup = popup;

export const item = style([
    interaction({ type: 'roving' }),
    typography({ style: 'body2' }),
    foregrounds({ color: 'normal-200' }),

    layerStyle('components', {
        position: 'relative',

        display: 'flex',
        alignItems: 'center',
        alignSelf: 'stretch',
        justifyContent: 'space-between',
        gap: vars.size.space['100'],

        border: 'none',

        borderRadius: vars.size.borderRadius['300'],
        cursor: 'pointer',
        paddingRight: vars.size.space['150'],
        paddingLeft: vars.size.space['250'],
        paddingBlock: vars.size.space['050'],

        height: vars.size.dimension['400'],

        selectors: {
            '&[data-disabled]': {
                opacity: 0.32,
                pointerEvents: 'none',
            },
        },
    }),
]);

export const separator = layerStyle('components', {
    flexShrink: 0,
    marginBlock: vars.size.space['050'],
    backgroundColor: vars.color.border.normal,
    height: '0.0625rem',
});

export const subTrigger = item;

export const groupLabel = style([
    typography({ style: 'subtitle2' }),
    foregrounds({ color: 'hint-200' }),
    layerStyle('components', {
        paddingTop: vars.size.space['100'],
        paddingRight: vars.size.space['050'],
        paddingBottom: vars.size.space['050'],
        paddingLeft: vars.size.space['250'],
    }),
]);

export const indicator = style([
    foregrounds({ color: 'normal-200' }),
    layerStyle('components', {
        position: 'absolute',
        top: '50%',
        left: vars.size.space['050'],
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: 'translateY(-50%)',
        width: vars.size.dimension['150'],
        height: vars.size.dimension['150'],
    }),
]);
