import { componentStyle } from '~/styles/mixins/layer-style.css';
import { typography } from '~/styles/mixins/typography.css';
import { vars } from '~/styles/themes.css';

export const popup = componentStyle([
    typography({ style: 'body3' }),
    {
        border: `0.0625rem solid ${vars.color.border.normal}`,
        borderRadius: vars.size.borderRadius['300'],
        boxShadow: vars.shadow.md,
        backgroundColor: vars.color.background['canvas-inverse'],
        paddingBlock: vars.size.space['075'],
        paddingInline: vars.size.space['100'],
        color: vars.color.foreground.inverse,
    },
]);

export const arrow = componentStyle({
    display: 'flex',
    color: vars.color.background['canvas-inverse'],

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
