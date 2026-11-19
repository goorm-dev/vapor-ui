import type { RecipeVariants } from '@vanilla-extract/recipes';

import { componentRecipe } from '~/styles/mixins/layer-style.css';

export const root = componentRecipe({
    defaultVariants: { reverse: false },
    variants: {
        /**
         * Reverses the order of the children, setting `flex-direction` to `row-reverse`.
         */
        reverse: {
            true: { flexDirection: 'row-reverse' },
            false: { flexDirection: 'row' },
        },
    },
});

export type RootVariants = NonNullable<RecipeVariants<typeof root>>;
