import type { RecipeVariants } from '@vanilla-extract/recipes';

import { componentRecipe } from '~/styles/mixins/layer-style.css';
import { vars } from '~/styles/themes.css';

export const root = componentRecipe({
    base: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: vars.size.space['050'],
    },

    defaultVariants: { size: 'md' },
    variants: {
        /**
         * Size of the toggles in the group, controlling their height and width. A `Toggle` that sets its own `size` keeps it.
         */
        size: { sm: {}, md: {}, lg: {}, xl: {} },
    },
});

export type RootVariants = NonNullable<RecipeVariants<typeof root>>;
