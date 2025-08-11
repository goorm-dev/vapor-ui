import { typography } from '~/styles/mixins/typography.css';
import { layerStyle } from '~/styles/utils';
import { vars } from '~/styles/vars.css';

export const content = [
    typography({ style: 'body3' }),
    layerStyle('components', {
        paddingBlock: vars.size.space['075'],
        paddingInline: vars.size.space['100'],
        borderRadius: vars.size.borderRadius['300'],
        backgroundColor: vars.color.background.contrast,
        color: vars.color.white,
        boxShadow: vars.shadow.md,

        border: `1px solid ${vars.color.border.normal}`,
    }),
];

export const arrow = layerStyle('components', {
    color: vars.color.background.contrast,
});
