import { style } from '@vanilla-extract/css';

import { foregrounds } from '~/styles/mixins/foreground.css';
import { typography } from '~/styles/mixins/typography.css';
import { layerStyle } from '~/styles/utils';
import { vars } from '~/styles/vars.css';

export const content = style({
    borderRadius: vars.size.borderRadius[300],

    boxShadow: vars.shadow.md,
    backgroundColor: vars.color.background['normal-lighter'],

    paddingBlock: vars.size.space[150],
    paddingInline: vars.size.space[200],

    width: '12.5rem',
});

export const arrow = layerStyle('components', {
    display: 'flex',
    color: vars.color.background['normal-lighter'],

    selectors: {
        '&[data-side="top"]': {
            bottom: 0,
            transform: 'translateY(60%) rotate(90deg)',
        },
        '&[data-side="right"]': {
            left: 0,
            transform: 'translateX(-60%) rotate(180deg)',
        },
        '&[data-side="bottom"]': {
            top: 0,
            transform: 'translateY(-60%) rotate(-90deg)',
        },
        '&[data-side="left"]': {
            right: 0,
            transform: 'translateX(60%) rotate(0deg)',
        },
    },
});

export const title = style([typography({ style: 'heading5' }), foregrounds({ color: 'normal' })]);

export const description = style([
    typography({ style: 'body2' }),
    foregrounds({ color: 'normal' }),
]);
