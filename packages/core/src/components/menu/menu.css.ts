import { calc } from '@vanilla-extract/css-utils';

import { root as checkboxRoot } from '~/components/checkbox/checkbox.css';
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
    transition: 'ease 0.15s',

    border: `0.0625rem solid ${vars.color.border.normal}`,
    borderRadius: vars.size.borderRadius['300'],
    boxShadow: vars.shadow.md,

    backgroundColor: vars.color.background['canvas-overlay'],
    padding: vars.size.space['050'],
    minWidth: 'max(var(--anchor-width), 12.5rem)',

    overflowY: 'auto',

    ':focus-visible': { outline: 'none' },

    selectors: {
        '&[data-starting-style], &[data-ending-style]': {
            opacity: 0,
            translate: '0 -4px',
        },
        '&[data-ending-style]': {
            transitionTimingFunction: 'cubic-bezier(0.5, 0, 1, 1)',
        },
    },
});

export const subPopup = componentStyle([
    popup,
    {
        selectors: {
            '&[data-starting-style], &[data-ending-style]': {
                translate: '-4px 0',
            },
        },
    },
]);

export const item = componentStyle([
    interaction({ type: 'roving' }),
    typography({ style: 'body2' }),
    foregrounds({ color: 'normal' }),

    {
        position: 'relative',

        display: 'flex',
        alignItems: 'center',
        alignSelf: 'stretch',
        gap: vars.size.space['075'],

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
    marginBlock: vars.size.space['075'],
    marginInline: vars.size.space['050'],
    backgroundColor: vars.color.border.normal,
    height: '0.0625rem',
});

export const subTrigger = componentStyle([item, { paddingRight: vars.size.space['075'] }]);

export const subTriggerIcon = componentStyle([
    foregrounds({ color: 'secondary' }),
    { marginLeft: 'auto' },
]);

export const groupLabel = componentStyle([
    typography({ style: 'subtitle2' }),
    foregrounds({ color: 'hint' }),
    {
        paddingTop: vars.size.space['100'],
        paddingRight: vars.size.space['150'],
        paddingBottom: vars.size.space['050'],
        paddingLeft: vars.size.space['150'],
    },
]);

export const radioIndicator = componentStyle([
    foregrounds({ color: 'normal' }),
    {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: calc.multiply(vars.size.space['025'], -1),
        width: vars.size.dimension['250'],
        height: vars.size.dimension['250'],
    },
]);

const checkbox = checkboxRoot({ size: 'md', invalid: false });
export const checkboxIndicator = componentStyle(checkbox);

export const icon = componentStyle({
    transition: 'all 0.2s',
    width: vars.size.dimension[100],
    height: vars.size.dimension[100],

    fill: 'none',
    stroke: vars.color.foreground.staticWhite,
    strokeWidth: '4px',
    strokeDasharray: '22',
    strokeDashoffset: '66px',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',

    selectors: {
        [`${checkboxIndicator}[data-checked] > &`]: {
            strokeDashoffset: '44px',
        },
    },
});
