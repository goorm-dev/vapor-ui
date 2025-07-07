import { vars } from '~/styles/contract.css';
import { layerStyle } from '~/styles/utils';

export const root = layerStyle('component', {
    display: 'flex',
    flexDirection: 'column',

    border: `1px solid ${vars.color.border.normal}`,
    borderRadius: vars.size.borderRadius[300],

    backgroundColor: vars.color.background.normal,
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
