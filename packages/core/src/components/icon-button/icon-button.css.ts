import type { RecipeVariants } from '@vanilla-extract/recipes';
import { recipe } from '@vanilla-extract/recipes';

import { layerStyle } from '~/styles/utils/layer-style.css';
import { vars } from '~/styles/vars.css';

export const root = recipe({
    base: layerStyle('components', {
        aspectRatio: '1 / 1',
        padding: 0,
        verticalAlign: 'top',
    }),

    defaultVariants: { shape: 'square' },
    variants: {
        /** Use the shape prop to change the shape of the icon button */
        shape: {
            square: {},
            circle: layerStyle('components', { borderRadius: '9999px' }),
        },
    },
});

export const icon = recipe({
    defaultVariants: { size: 'md' },
    variants: {
        /** Use the size prop to change the size of the icon */
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
