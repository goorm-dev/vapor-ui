import type { RecipeVariants } from '@vanilla-extract/recipes';

import { foregroundVariants, foregrounds } from '~/styles/mixins/foreground.css';
import { componentRecipe, componentStyle } from '~/styles/mixins/layer-style.css';
import { when } from '~/styles/mixins/logical-states';
import { typography, typographyVariants } from '~/styles/mixins/typography.css';
import { vars } from '~/styles/themes.css';

export const root = componentStyle({
    display: 'flex',
    flexDirection: 'column',
    gap: vars.size.space['050'],
});

export const description = componentStyle([
    typography({ style: 'body2' }),
    foregrounds({ color: 'hint-100' }),
    {
        selectors: {
            [when.disabled()]: { opacity: 0.32, pointerEvents: 'none' },
        },
    },
]);

export const error = componentStyle([
    typography({ style: 'body2' }),
    foregrounds({ color: 'danger-100' }),
    {
        selectors: {
            [when.disabled()]: { opacity: 0.32, pointerEvents: 'none' },
        },
    },
]);

export const success = componentStyle([
    typography({ style: 'body2' }),
    foregrounds({ color: 'success-100' }),
    {
        selectors: {
            [when.disabled()]: { opacity: 0.32, pointerEvents: 'none' },
        },
    },
]);

export const label = componentRecipe({
    base: {
        display: 'flex',
        gap: vars.size.space['100'],

        selectors: {
            [when.disabled()]: { opacity: 0.32, pointerEvents: 'none' },
        },
    },

    defaultVariants: {
        typography: 'body2',
        foreground: 'normal-100',
    },

    variants: {
        typography: typographyVariants,
        foreground: foregroundVariants,
    },
});

export const item = componentStyle({
    display: 'flex',
    alignItems: 'flex-start',
    gap: vars.size.space['100'],

    selectors: {
        [when.disabled()]: { opacity: 0.32, pointerEvents: 'none' },
    },
});

export type LabelVariants = NonNullable<RecipeVariants<typeof label>>;
