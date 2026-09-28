import type { RecipeVariants } from '@vanilla-extract/recipes';

import { componentRecipe } from '~/styles/mixins/layer-style.css';

export const root = componentRecipe({
    defaultVariants: { reverse: false },
    variants: {
        reverse: {
            true: { flexDirection: 'row-reverse' },
            false: { flexDirection: 'row' },
        },
    },
});

export type RootVariants = NonNullable<RecipeVariants<typeof root>>;
