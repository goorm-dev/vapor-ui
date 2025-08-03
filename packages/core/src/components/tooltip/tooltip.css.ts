import { typography } from '~/styles/mixins/typography.css';
import { layerStyle } from '~/styles/utils';
import { vars } from '~/styles/vars.css';

export const content = [
    typography({ style: 'body3' }),
    layerStyle('components', {
        paddingBlock: vars.size.space['075'],
        paddingInline: vars.size.space['100'],
        borderRadius: vars.size.borderRadius['300'],
        backgroundColor: vars.color.background.normal,
        boxShadow: `0 4px 10px 0 rgba(0, 0, 0, 0.20)`,
    }),
];

export const arrow = layerStyle('components', {
    display: 'flex',

    selectors: {
        '&[data-side="top"]': {
            bottom: 0,
            transform: 'translateY(50%) rotate(90deg)',
        },

        '&[data-side="right"]': {
            left: 0,
            transform: 'translateX(-50%) rotate(180deg)',
        },

        '&[data-side="bottom"]': {
            top: 0,
            transform: 'translateY(-50%) rotate(-90deg)',
        },

        '&[data-side="left"]': {
            right: 0,
            transform: 'translateX(50%) rotate(0deg)',
        },
    },
});
