import { style } from '@vanilla-extract/css';

import { foregrounds } from '~/styles/mixins/foreground.css';
import { typography } from '~/styles/mixins/typography.css';
import { layerStyle } from '~/styles/utils';
import { vars } from '~/styles/vars.css';

export const content = style({
    outline: 'none',
    border: `1px solid ${vars.color.border.normal}`,

    borderRadius: vars.size.borderRadius[300],
    boxShadow: vars.shadow.md,

    backgroundColor: vars.color.background['normal-lighter'],
    paddingBlock: vars.size.space[150],

    paddingInline: vars.size.space[200],

    minWidth: '12.5rem',
});

export const arrow = layerStyle('components', {
    display: 'flex',
    color: vars.color.background['normal-lighter'],

    transform: 'rotate(180deg)',
    zIndex: 1,

    selectors: {
        '&[data-side="top"]': {
            bottom: '-11px',
            transform: 'rotate(-90deg)',
        },
        '&[data-side="right"]': {
            left: '-7px',
            transform: 'rotate(0deg)',
        },
        '&[data-side="bottom"]': {
            top: '-11px',
            transform: 'rotate(90deg)',
        },
        '&[data-side="left"]': {
            right: '-7px',
            transform: 'rotate(180deg)',
        },
    },
});

export const title = style([typography({ style: 'heading5' }), foregrounds({ color: 'normal' })]);

export const description = style([
    typography({ style: 'body2' }),
    foregrounds({ color: 'normal' }),
]);
