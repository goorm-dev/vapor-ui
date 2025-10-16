import type { RecipeVariants } from '@vanilla-extract/recipes';
import { recipe } from '@vanilla-extract/recipes';

import { foregrounds } from '~/styles/mixins/foreground.css';
import { typography } from '~/styles/mixins/typography.css';
import { layerStyle } from '~/styles/utils/layer-style.css';
import { vars } from '~/styles/vars.css';

export const root = recipe({
    base: layerStyle('components', {
        display: 'flex',
        flexWrap: 'wrap',
    }),

    defaultVariants: { size: 'md', orientation: 'vertical' },
    variants: {
        size: {
            md: layerStyle('components', {
                rowGap: vars.size.space['050'],
                columnGap: vars.size.space['050'],
            }),
            lg: layerStyle('components', {
                rowGap: vars.size.space['100'],
                columnGap: vars.size.space['100'],
            }),
        },
        orientation: {
            horizontal: layerStyle('components', {
                flexDirection: 'row',
                alignContent: 'flex-start',
                columnGap: vars.size.space['200'],
            }),
            vertical: layerStyle('components', {
                flexDirection: 'column',
            }),
        },
    },
});

export const label = [
    foregrounds({ color: 'normal-100' }),
    typography({ style: 'subtitle2' }),
    layerStyle('components', {
        flexBasis: '100%',
        order: -1,
    }),
];

export type RootVariants = NonNullable<RecipeVariants<typeof root>>;
