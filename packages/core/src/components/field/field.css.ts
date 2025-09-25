import { recipe } from '@vanilla-extract/recipes';

import { foregrounds } from '~/styles/mixins/foreground.css';
import { typography } from '~/styles/mixins/typography.css';
import { layerStyle } from '~/styles/utils/layer-style.css';
import { vars } from '~/styles/vars.css';

export const root = recipe({
    base: {
        display: 'flex',
        flexDirection: 'column',
        gap: vars.size.space['050'],
    },
});

export const description = recipe({
    base: [
        typography({ style: 'body2' }),
        foregrounds({ color: 'hint-100' }),
        layerStyle('components', {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: vars.size.space['050'],
            selectors: {
                '&:is(:disabled, [data-disabled])': {
                    opacity: 0.32,
                    pointerEvents: 'none',
                },
            },
        }),
    ],
});

export const error = recipe({
    base: [
        typography({ style: 'body2' }),
        foregrounds({ color: 'danger-100' }),
        layerStyle('components', {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: vars.size.space['050'],
            selectors: {
                '&:is(:disabled, [data-disabled])': {
                    opacity: 0.32,
                    pointerEvents: 'none',
                },
            },
        }),
    ],
});

export const success = recipe({
    base: [
        typography({ style: 'body2' }),
        foregrounds({ color: 'success-100' }),
        layerStyle('components', {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: vars.size.space['050'],
            selectors: {
                '&:is(:disabled, [data-disabled])': {
                    opacity: 0.32,
                    pointerEvents: 'none',
                },
            },
        }),
    ],
});

export const label = recipe({
    base: [
        typography({ style: 'subtitle2' }),
        foregrounds({ color: 'normal-100' }),
        layerStyle('components', {
            selectors: {
                '&:is(:disabled, [data-disabled])': {
                    opacity: 0.32,
                    pointerEvents: 'none',
                },
            },
        }),
    ],
});
