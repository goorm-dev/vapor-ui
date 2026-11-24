import type { RecipeVariants } from '@vanilla-extract/recipes';

import { componentRecipe } from '~/styles/mixins/layer-style.css';

export const root = componentRecipe({
    defaultVariants: { inline: false },
    variants: {
        /**
         * Displays the container as `inline-flex` instead of `flex`, so it sits inline with surrounding content.
         */
        inline: {
            true: { display: 'inline-flex' },
            false: { display: 'flex' },
        },
    },
});

export type RootVariants = NonNullable<RecipeVariants<typeof root>>;
