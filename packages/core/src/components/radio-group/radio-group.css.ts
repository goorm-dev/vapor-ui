import type { RecipeVariants } from '@vanilla-extract/recipes';

import { foregrounds } from '~/styles/mixins/foreground.css';
import { componentRecipe, componentStyle } from '~/styles/mixins/layer-style.css';
import { typography } from '~/styles/mixins/typography.css';
import { vars } from '~/styles/themes.css';

export const root = componentRecipe({
    base: {
        display: 'flex',
        flexDirection: 'column',
        gap: vars.size.space[100],
    },

    defaultVariants: { size: 'md' },
    variants: {
        /**
         * Size of the radios in the group, controlling their width and height. A `Radio.Root` that sets its own `size` keeps it.
         */
        size: {
            md: {},
            lg: {},
        },
    },
});

export const label = componentStyle([
    foregrounds({ color: 'secondary' }),
    typography({ style: 'subtitle2' }),
]);

export type RootVariants = NonNullable<RecipeVariants<typeof root>>;
