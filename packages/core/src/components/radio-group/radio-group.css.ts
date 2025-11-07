import type { RecipeVariants } from '@vanilla-extract/recipes';
import { recipe } from '@vanilla-extract/recipes';

import { foregrounds } from '~/styles/mixins/foreground.css';
import { layerStyle } from '~/styles/mixins/layer-style.css';
import { typography } from '~/styles/mixins/typography.css';
import { vars } from '~/styles/themes.css';

export const root = recipe({
    base: layerStyle('components', {
        display: 'flex',
        flexDirection: 'column',
        gap: vars.size.space[100],
    }),

    defaultVariants: { size: 'md' },
    variants: {
        size: {
            md: {},
            lg: {},
        },
    },
});

export const label = [foregrounds({ color: 'normal-100' }), typography({ style: 'subtitle2' })];

export type RootVariants = NonNullable<RecipeVariants<typeof root>>;
