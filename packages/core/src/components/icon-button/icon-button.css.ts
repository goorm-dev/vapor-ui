import type { RecipeVariants } from '@vanilla-extract/recipes';

import { componentRecipe, componentStyle } from '~/styles/mixins/layer-style.css';

export const root = componentRecipe({
    base: {
        aspectRatio: '1 / 1',
        padding: 0,
        verticalAlign: 'top',
    },
    defaultVariants: { shape: 'square' },
    variants: {
        shape: {
            square: {},
            circle: { borderRadius: '9999px' },
        },
    },
});

export const icon = componentStyle({
    selectors: {
        [`${root.classNames.base} > &:is(svg)`]: {
            width: 'max(16px, 50%)',
            height: 'max(16px, 50%)',
        },
    },
});

export type IconButtonVariants = NonNullable<RecipeVariants<typeof root>>;
