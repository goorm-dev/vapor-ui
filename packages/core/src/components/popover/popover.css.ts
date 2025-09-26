import { style } from '@vanilla-extract/css';

import { layerStyle } from '~/styles/utils';
import { vars } from '~/styles/vars.css';

export const popup = style({
    outline: 'none',
    border: `1px solid ${vars.color.border.normal}`,

    borderRadius: vars.size.borderRadius[300],
    boxShadow: vars.shadow.md,

    backgroundColor: vars.color.background.surface[100],
    paddingBlock: vars.size.space[150],

    paddingInline: vars.size.space[200],

    minWidth: '12.5rem',
});

export const arrow = layerStyle('components', {
    display: 'flex',
    color: vars.color.background.surface[100], // It's background-color, but since it's an SVG, it's specified as color.

    width: vars.size.dimension[100],
    height: vars.size.dimension[200],

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
