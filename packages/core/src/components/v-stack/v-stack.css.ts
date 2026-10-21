import type { RecipeVariants } from '@vanilla-extract/recipes';

import { componentRecipe } from '~/styles/mixins/layer-style.css';

export const root = componentRecipe({
    defaultVariants: { reverse: false },
    variants: {
        reverse: {
            true: { flexDirection: 'column-reverse' },
            false: { flexDirection: 'column' },
        },
    },
});

export type RootVariants = NonNullable<RecipeVariants<typeof root>>;
