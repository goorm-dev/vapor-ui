import type { RecipeVariants } from '@vanilla-extract/recipes';
import { recipe } from '@vanilla-extract/recipes';

import { layerStyle } from '~/styles/mixins/layer-style.css';

export const root = recipe({
    base: [
        layerStyle('components', {
            aspectRatio: '1 / 1',
            padding: 0,
            verticalAlign: 'top',
        }),
    ],
    defaultVariants: { shape: 'square' },
    variants: {
        /**
         * Determines the shape of the IconButton.
         */
        shape: {
            square: {},
            circle: layerStyle('components', { borderRadius: '9999px' }),
        },
    },
});

export const icon = layerStyle('components', {
    selectors: {
        [`${root.classNames.base} > &:is(svg)`]: {
            width: 'max(16px, 50%)',
            height: 'max(16px, 50%)',
        },
    },
});

export type IconButtonVariants = NonNullable<RecipeVariants<typeof root>>;
