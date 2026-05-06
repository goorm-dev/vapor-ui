import { componentStyle } from '~/styles/mixins/layer-style.css';
import { vars } from '~/styles/themes.css';

export const popup = componentStyle({
    outline: 'none',
    border: `1px solid ${vars.color.border.normal}`,

    borderRadius: vars.size.borderRadius[300],
    boxShadow: vars.shadow.md,

    backgroundColor: vars.color.background.overlay[100],
    paddingBlock: vars.size.space[150],

    paddingInline: vars.size.space[200],

    minWidth: '12.5rem',
});

export const arrow = componentStyle({
    display: 'flex',
    color: vars.color.background.overlay[100], // It's background-color, but since it's an SVG, it's specified as color.

    width: vars.size.dimension[200],
    height: vars.size.dimension[100],
    zIndex: 1,
});
