import type { RecipeVariants } from '@vanilla-extract/recipes';
import { recipe } from '@vanilla-extract/recipes';

import { typography } from '~/styles/mixins/typography.css';
import { layerStyle } from '~/styles/utils';
import { vars } from '~/styles/vars.css';

export const list = layerStyle('vapor-component', {
    display: 'inline-flex',
    alignItems: 'center',
});

export const item = layerStyle('vapor-component', {
    display: 'inline-flex',
    alignItems: 'center',
});

export const link = recipe({
    base: layerStyle('vapor-component', {
        transition: 'text-decoration 0.2s ease-in-out',
    }),

    defaultVariants: { size: 'md', current: false },
    variants: {
        size: {
            sm: typography({ style: 'body4' }),
            md: typography({ style: 'body3' }),
            lg: typography({ style: 'body2' }),
            xl: typography({ style: 'body1' }),
        },

        current: {
            false: layerStyle('vapor-component', {
                color: vars.color.foreground.hint,

                ':hover': {
                    textDecoration: 'underline',
                    textUnderlineOffset: 2,
                },
            }),
            true: layerStyle('vapor-component', {
                color: vars.color.foreground.primary,
            }),
        },
    },
});

export const icon = layerStyle('vapor-component', {
    color: vars.color.foreground.hint,
    display: 'block',
});

export type BreadcrumbItemVariants = NonNullable<RecipeVariants<typeof link>>;
