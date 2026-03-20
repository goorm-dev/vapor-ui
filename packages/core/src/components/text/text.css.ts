import type { RecipeVariants } from '@vanilla-extract/recipes';

import { foregroundVariants } from '~/styles/mixins/foreground.css';
import { componentRecipe } from '~/styles/mixins/layer-style.css';
import { typographyVariants } from '~/styles/mixins/typography.css';

export const root = componentRecipe({
    base: {},
    defaultVariants: { typography: 'body1', foreground: 'normal-200' },
    variants: {
        typography: typographyVariants,
        foreground: foregroundVariants,
    },
});

export type TextVariants = NonNullable<RecipeVariants<typeof root>>;
