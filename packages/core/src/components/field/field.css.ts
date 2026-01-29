import { style } from '@vanilla-extract/css';
import type { RecipeVariants } from '@vanilla-extract/recipes';
import { recipe } from '@vanilla-extract/recipes';

import { foregroundVariants, foregrounds } from '~/styles/mixins/foreground.css';
import { layerStyle } from '~/styles/mixins/layer-style.css';
import { typography, typographyVariants } from '~/styles/mixins/typography.css';
import { vars } from '~/styles/themes.css';

export const root = layerStyle('components', {
    display: 'flex',
    flexDirection: 'column',
    gap: vars.size.space['050'],
});

export const description = style([
    typography({ style: 'body2' }),
    foregrounds({ color: 'hint-100' }),
    layerStyle('components', {
        selectors: {
            '&[data-disabled]': { opacity: 0.32, pointerEvents: 'none' },
        },
    }),
]);

export const error = style([
    typography({ style: 'body2' }),
    foregrounds({ color: 'danger-100' }),
    layerStyle('components', {
        selectors: {
            '&[data-disabled]': { opacity: 0.32, pointerEvents: 'none' },
        },
    }),
]);

export const success = style([
    typography({ style: 'body2' }),
    foregrounds({ color: 'success-100' }),
    layerStyle('components', {
        selectors: {
            '&[data-disabled]': { opacity: 0.32, pointerEvents: 'none' },
        },
    }),
]);

export const label = recipe({
    base: layerStyle('components', {
        display: 'flex',
        gap: vars.size.space['100'],

        selectors: {
            '&[data-disabled]': { opacity: 0.32, pointerEvents: 'none' },
        },
    }),

    defaultVariants: {
        typography: 'body2',
        foreground: 'normal-100',
    },

    variants: {
        /**
         * Determines the typography style of the label.
         */
        typography: typographyVariants,
        /**
         * Determines the foreground color of the label.
         */
        foreground: foregroundVariants,
    },
});

export type LabelVariants = NonNullable<RecipeVariants<typeof label>>;

export const item = layerStyle('components', {
    display: 'flex',
    alignItems: 'flex-start',
    gap: vars.size.space['100'],

    selectors: {
        '&[data-disabled]': { opacity: 0.32, pointerEvents: 'none' },
    },
});
