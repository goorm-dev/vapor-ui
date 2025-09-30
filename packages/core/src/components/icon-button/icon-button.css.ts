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
    /**
     * 아이콘 버튼의 모양을 결정합니다.
     */
    variants: {
        shape: {
            square: {},
            circle: layerStyle('components', { borderRadius: '9999px' }),
        },
    },
});

export const icon = recipe({
    /**
     * 아이콘의 크기를 결정합니다.
     */

    defaultVariants: { size: 'md' },
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
