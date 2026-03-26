import { componentStyle } from '~/styles/mixins/layer-style.css';
import { typography } from '~/styles/mixins/typography.css';
import { vars } from '~/styles/themes.css';

export const popup = componentStyle([
    typography({ style: 'body3' }),
    {
        paddingBlock: vars.size.space['075'],
        paddingInline: vars.size.space['100'],
        borderRadius: vars.size.borderRadius['300'],
        backgroundColor: vars.color.background.contrast[200],
        border: `0.0625rem solid ${vars.color.border.normal}`,
        color: vars.color.white,
        boxShadow: vars.shadow.md,
    },
]);

export const arrow = componentStyle({
    display: 'flex',
    color: vars.color.background.contrast[200],
});
