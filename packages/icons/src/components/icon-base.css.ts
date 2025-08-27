import { createVar, style } from '@vanilla-extract/css';

export const vaporIconWidth = createVar();
export const vaporIconHeight = createVar();

export const container_width = style({
    width: vaporIconWidth,
});

export const container_height = style({
    height: vaporIconHeight,
});
