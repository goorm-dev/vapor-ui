import { createGlobalVar, style } from '@vanilla-extract/css';

export const vaporIconWidth = createGlobalVar('vapor-icon-width');
export const vaporIconHeight = createGlobalVar('vapor-icon-height');

export const container_width = style({
    width: vaporIconWidth,
});

export const container_height = style({
    height: vaporIconHeight,
});
