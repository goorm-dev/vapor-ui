import type { RecipeVariants } from '@vanilla-extract/recipes';
import { recipe } from '@vanilla-extract/recipes';

import { layerStyle } from '~/styles/utils/layer-style.css';
import { vars } from '~/styles/vars.css';

export const root = recipe({
    base: layerStyle('components', {
        display: 'flex',
    }),

    defaultVariants: { size: 'md', orientation: 'vertical' },
    variants: {
        size: {
            md: layerStyle('components', { gap: vars.size.space['100'] }),
        },
        orientation: {
            horizontal: layerStyle('components', { flexDirection: 'row' }),
            vertical: layerStyle('components', { flexDirection: 'column' }),
        },
    },
});

export type RootVariants = NonNullable<RecipeVariants<typeof root>>;
