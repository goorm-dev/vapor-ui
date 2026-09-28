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
        size: { sm: {}, md: {}, lg: {}, xl: {} },
    },
});

export type RootVariants = NonNullable<RecipeVariants<typeof root>>;
