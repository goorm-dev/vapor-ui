import type { RecipeVariants } from '@vanilla-extract/recipes';

import { foregroundVariants } from '~/styles/mixins/foreground.css';
import { componentRecipe } from '~/styles/mixins/layer-style.css';
import { typographyVariants } from '~/styles/mixins/typography.css';

export const root = componentRecipe({
    base: {},
    defaultVariants: { typography: 'body1', foreground: 'normal' },
    variants: {
        /**
         * Typography style of the text, setting font size, line height, font weight, and letter spacing.
         */
        typography: typographyVariants,
        /**
         * Color of the text, chosen from the foreground color palette.
         */
        foreground: foregroundVariants,
    },
});

export type TextVariants = NonNullable<RecipeVariants<typeof root>>;
