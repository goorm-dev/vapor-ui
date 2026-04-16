import { foregrounds } from '~/styles/mixins/foreground.css';
import { interaction } from '~/styles/mixins/interactions.css';
import { componentStyle } from '~/styles/mixins/layer-style.css';
import { when } from '~/styles/mixins/logical-states';
import { typography } from '~/styles/mixins/typography.css';
import { vars } from '~/styles/themes.css';

export const positioner = componentStyle({
    position: 'relative',
});

export const popup = componentStyle({
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

export const item = componentStyle([
    interaction({ type: 'roving' }),
    typography({ style: 'body2' }),
    foregrounds({ color: 'normal-200' }),

    {
        position: 'relative',

        display: 'flex',
        alignItems: 'center',
        alignSelf: 'stretch',
        justifyContent: 'space-between',
        gap: vars.size.space['050'],

        border: 'none',

        borderRadius: vars.size.borderRadius['300'],
        cursor: 'pointer',
        paddingRight: vars.size.space['150'],
        paddingLeft: vars.size.space['250'],
        paddingBlock: vars.size.space['050'],

        height: vars.size.dimension['400'],

        selectors: {
            [when.disabled()]: {
                opacity: 0.32,
                pointerEvents: 'none',
            },
        },
    },
]);

export const separator = componentStyle({
    flexShrink: 0,
    marginBlock: vars.size.space['050'],
    backgroundColor: vars.color.border.normal,
    height: '0.0625rem',
});

export const subTrigger = item;

export const groupLabel = componentStyle([
    typography({ style: 'subtitle2' }),
    foregrounds({ color: 'hint-200' }),
    {
        paddingTop: vars.size.space['100'],
        paddingRight: vars.size.space['050'],
        paddingBottom: vars.size.space['050'],
        paddingLeft: vars.size.space['250'],
    },
]);

export const indicator = componentStyle([
    foregrounds({ color: 'normal-200' }),
    {
        position: 'absolute',
        top: '50%',
        left: vars.size.space['050'],
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: 'translateY(-50%)',
        width: vars.size.dimension['150'],
        height: vars.size.dimension['150'],
    },
]);
