import { style } from '@vanilla-extract/css';

import { foregrounds } from '~/styles/mixins/foreground.css';
import { typography } from '~/styles/mixins/typography.css';
import { layerStyle } from '~/styles/utils/layer-style.css';
import { vars } from '~/styles/vars.css';

export const root = layerStyle('components', {
    display: 'flex',
    flexDirection: 'column',
    gap: vars.size.space['050'],
});

export const description = style([
    typography({ style: 'body2' }),
    foregrounds({ color: 'hint-100' }),
    layerStyle('components', {
        display: 'flex',
        alignItems: 'center',
        gap: vars.size.space['050'],

        selectors: {
            '&[data-disabled]': { opacity: 0.32, pointerEvents: 'none' },
        },
    }),
]);

export const error = style([
    typography({ style: 'body2' }),
    foregrounds({ color: 'danger-100' }),
    layerStyle('components', {
        display: 'flex',
        alignItems: 'center',
        gap: vars.size.space['050'],
        selectors: {
            '&[data-disabled]': { opacity: 0.32, pointerEvents: 'none' },
        },
    }),
]);

export const success = style([
    typography({ style: 'body2' }),
    foregrounds({ color: 'success-100' }),
    layerStyle('components', {
        display: 'flex',
        alignItems: 'center',
        gap: vars.size.space['050'],

        selectors: {
            '&[data-disabled]': { opacity: 0.32, pointerEvents: 'none' },
        },
    }),
]);

export const label = [
    typography({ style: 'body2' }),
    foregrounds({ color: 'normal-200' }),

    layerStyle('components', {
        display: 'flex',
        gap: vars.size.space['100'],

        selectors: {
            '&[data-disabled]': { opacity: 0.32, pointerEvents: 'none' },
        },
    }),
];
