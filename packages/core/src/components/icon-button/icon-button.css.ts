import type { RecipeVariants } from '@vanilla-extract/recipes';
import { recipe } from '@vanilla-extract/recipes';

import { layerStyle } from '~/styles/utils/layer-style.css';
import { vars } from '~/styles/vars.css';

export const root = recipe({
    base: layerStyle('vapor-component', {
        aspectRatio: '1 / 1',
        padding: 0,
    }),

    defaultVariants: { shape: 'square' },
    variants: {
        shape: {
            square: {},
            circle: layerStyle('vapor-component', { borderRadius: '9999px' }),
        },
    },
});

export const icon = recipe({
    variants: {
        size: {
            sm: layerStyle('vapor-component', {
                width: vars.size.dimension[200],
                height: vars.size.dimension[200],
            }),
            md: layerStyle('vapor-component', {
                width: vars.size.dimension[200],
                height: vars.size.dimension[200],
            }),
            lg: layerStyle('vapor-component', {
                width: vars.size.dimension[250],
                height: vars.size.dimension[250],
            }),
            xl: layerStyle('vapor-component', {
                width: vars.size.dimension[300],
                height: vars.size.dimension[300],
            }),
        },
    },
});

export type IconButtonVariants = NonNullable<RecipeVariants<typeof root>>;
