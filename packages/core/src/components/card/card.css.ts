import { layerStyle } from '~/styles/utils/layer-style.css';
import { vars } from '~/styles/vars.css';

export const root = layerStyle('component', {
    display: 'flex',
    flexDirection: 'column',

    border: `1px solid ${vars.color.border.normal}`,
    borderRadius: vars.size.borderRadius[300],

    backgroundColor: vars.color.background['normal-lighter'],
});

export const header = layerStyle('component', {
    borderBottom: `1px solid ${vars.color.border.normal}`,

    padding: `${vars.size.space[200]} ${vars.size.space[300]}`,
});

export const body = layerStyle('component', {
    padding: vars.size.space[300],
});

export const footer = layerStyle('component', {
    borderTop: `1px solid ${vars.color.border.normal}`,

    padding: `${vars.size.space[200]} ${vars.size.space[300]}`,
});
