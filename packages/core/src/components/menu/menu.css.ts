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

    backgroundColor: vars.color.background['canvas-overlay'],
    padding: vars.size.space['050'],
    minWidth: '12.5rem',

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
    foregrounds({ color: 'normal' }),

    {
        position: 'relative',

        display: 'flex',
        alignItems: 'center',
        alignSelf: 'stretch',
        gap: vars.size.space['050'],

        border: 'none',

        borderRadius: vars.size.borderRadius['300'],
        cursor: 'pointer',
        paddingBlock: vars.size.space['100'],
        paddingInline: vars.size.space['150'],

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

export const subTrigger = componentStyle([item, { paddingRight: vars.size.space['075'] }]);

export const subTriggerIcon = componentStyle({
    marginLeft: 'auto',
});

export const groupLabel = componentStyle([
    typography({ style: 'subtitle2' }),
    foregrounds({ color: 'secondary' }),
    {
        paddingTop: vars.size.space['075'],
        paddingRight: vars.size.space['100'],
        paddingBottom: vars.size.space['050'],
        paddingLeft: vars.size.space['150'],
    },
]);

export const indicator = componentStyle([
    foregrounds({ color: 'normal' }),
    {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: vars.size.dimension['200'],
        height: vars.size.dimension['200'],
    },
]);
