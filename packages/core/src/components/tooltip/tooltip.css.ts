import { typography } from '~/styles/mixins/typography.css';
import { vars } from '~/styles/themes.css';
import { layerStyle } from '~/styles/utils';

export const popup = [
    typography({ style: 'body3' }),
    layerStyle('components', {
        paddingBlock: vars.size.space['075'],
        paddingInline: vars.size.space['100'],
        borderRadius: vars.size.borderRadius['300'],
        backgroundColor: vars.color.background.contrast[200],
        border: `0.0625rem solid ${vars.color.border.normal}`,
        color: vars.color.white,
        boxShadow: vars.shadow.md,
    }),
];

export const arrow = layerStyle('components', {
    display: 'flex',
    color: vars.color.background.contrast[200],

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
