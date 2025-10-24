import type { RecipeVariants } from '@vanilla-extract/recipes';
import { recipe } from '@vanilla-extract/recipes';

import { layerStyle } from '~/styles/mixins/layer-style.css';
import { vars } from '~/styles/themes.css';

import { root as buttonRecipe } from '../button/button.css';

export const root = recipe({
    base: [
        buttonRecipe.classNames.base,
        layerStyle('components', {
            aspectRatio: '1 / 1',
            padding: 0,
            verticalAlign: 'top',
        }),
    ],
    defaultVariants: { shape: 'square' },
    variants: {
        shape: {
            square: {},
            circle: layerStyle('components', { borderRadius: '9999px' }),
        },
    },
});

export const icon = recipe({
    variants: {
        size: {
            sm: layerStyle('components', {
                width: vars.size.dimension[200],
                height: vars.size.dimension[200],
            }),
            md: layerStyle('components', {
                width: vars.size.dimension[200],
                height: vars.size.dimension[200],
            }),
            lg: layerStyle('components', {
                width: vars.size.dimension[250],
                height: vars.size.dimension[250],
            }),
            xl: layerStyle('components', {
                width: vars.size.dimension[300],
                height: vars.size.dimension[300],
            }),
        },
    },
});

export type IconButtonVariants = NonNullable<RecipeVariants<typeof root>>;
