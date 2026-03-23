import { componentStyle } from '~/styles/mixins/layer-style.css';
import { vars } from '~/styles/themes.css';

export const root = componentStyle({
    display: 'flex',
    flexDirection: 'column',

    border: `1px solid ${vars.color.border.normal}`,
    borderRadius: vars.size.borderRadius[300],

    backgroundColor: vars.color.background.overlay[100],
});

export const header = componentStyle({
    borderBottom: `1px solid ${vars.color.border.normal}`,

    padding: `${vars.size.space[200]} ${vars.size.space[300]}`,
});

export const body = componentStyle({
    padding: vars.size.space[300],
});

export const footer = componentStyle({
    borderTop: `1px solid ${vars.color.border.normal}`,

    padding: `${vars.size.space[200]} ${vars.size.space[300]}`,
});
