import type { RecipeVariants } from '@vanilla-extract/recipes';
import { recipe } from '@vanilla-extract/recipes';

import { foregrounds } from '~/styles/mixins/foreground.css';
import { typography } from '~/styles/mixins/typography.css';
import { layerStyle } from '~/styles/utils/layer-style.css';

export const root = recipe({
    base: {
        display: 'flex',
        flexDirection: 'column',
    },

    defaultVariants: { disabled: false },

    variants: {
        disabled: {
            true: {
                opacity: 0.32,
                pointerEvents: 'none',
            },
        },
    },
});

export const description = recipe({
    base: [typography({ style: 'body2' }), foregrounds({ color: 'hint' })],
});

export const error = recipe({
    base: [typography({ style: 'body2' }), foregrounds({ color: 'danger' })],
});

export const success = recipe({
    base: [typography({ style: 'body2' }), foregrounds({ color: 'success' })],
});

export const label = recipe({
    base: [
        typography({ style: 'subtitle2' }),
        foregrounds({ color: 'normal-lighter' }),
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

export type RootVariants = NonNullable<RecipeVariants<typeof root>>;
