import type { RecipeVariants } from '@vanilla-extract/recipes';
import { recipe } from '@vanilla-extract/recipes';

import { foregrounds } from '~/styles/mixins/foreground.css';
import { typography } from '~/styles/mixins/typography.css';
import { layerStyle } from '~/styles/utils/layer-style.css';
import { vars } from '~/styles/vars.css';

export const root = recipe({
    base: layerStyle('components', {
        display: 'flex',
    }),

    defaultVariants: { size: 'md', orientation: 'vertical' },
    variants: {
        size: {
            md: layerStyle('components', { gap: vars.size.space['050'] }),
            lg: layerStyle('components', { gap: vars.size.space['100'] }),
        },
        orientation: {
            horizontal: layerStyle('components', { flexDirection: 'row' }),
            vertical: layerStyle('components', { flexDirection: 'column' }),
        },
    },
});

export const label = [foregrounds({ color: 'normal' }), typography({ style: 'subtitle2' })];

export type RootVariants = NonNullable<RecipeVariants<typeof root>>;
