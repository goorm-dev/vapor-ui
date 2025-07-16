import type { RecipeVariants } from '@vanilla-extract/recipes';
import { recipe } from '@vanilla-extract/recipes';

import { layerStyle } from '~/styles/utils/layer-style.css';
import { vars } from '~/styles/vars.css';

export const root = recipe({
    base: layerStyle('component', {
        aspectRatio: '1 / 1',
        padding: 0,
        verticalAlign: 'top',
    }),

    defaultVariants: { shape: 'square' },
    variants: {
        shape: {
            square: {},
            circle: layerStyle('component', { borderRadius: '9999px' }),
        },
    },
});

export const icon = recipe({
    variants: {
        size: {
            sm: layerStyle('component', {
                width: vars.size.dimension[200],
                height: vars.size.dimension[200],
            }),
            md: layerStyle('component', {
                width: vars.size.dimension[200],
                height: vars.size.dimension[200],
            }),
            lg: layerStyle('component', {
                width: vars.size.dimension[250],
                height: vars.size.dimension[250],
            }),
            xl: layerStyle('component', {
                width: vars.size.dimension[300],
                height: vars.size.dimension[300],
            }),
        },
    },
});

export type IconButtonVariants = NonNullable<RecipeVariants<typeof root>>;
