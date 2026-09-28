import type { RecipeVariants } from '@vanilla-extract/recipes';

import { componentRecipe } from '~/styles/mixins/layer-style.css';

export const root = componentRecipe({
    defaultVariants: { inline: false },
    variants: {
        inline: {
            true: { display: 'inline-flex' },
            false: { display: 'flex' },
        },
    },
});

export type RootVariants = NonNullable<RecipeVariants<typeof root>>;
