import type { RecipeVariants } from '@vanilla-extract/recipes';
import { recipe } from '@vanilla-extract/recipes';

import { typography } from '~/styles/mixins/typography.css';
import { layerStyle } from '~/styles/utils';
import { vars } from '~/styles/vars.css';

export const list = layerStyle('components', {
    display: 'inline-flex',
    alignItems: 'center',
});

export const item = layerStyle('components', {
    display: 'inline-flex',
    alignItems: 'center',
});

export const link = recipe({
    defaultVariants: { size: 'md', current: false },
    variants: {
        size: {
            sm: typography({ style: 'body4' }),
            md: typography({ style: 'body3' }),
            lg: typography({ style: 'body2' }),
            xl: typography({ style: 'body1' }),
        },

        current: {
            false: [
                layerStyle('components', {
                    color: vars.color.foreground.hint,

                    // NOTE: When the link interaction style is declared multiple times, consider separating it.
                    ':hover': {
                        textDecoration: 'underline',
                    },
                    ':focus-visible': {
                        outline: 'none',
                        boxShadow: `0 0 0 2px hsl(0, 0%, 100%), 0 0 0 4px ${vars.color.foreground.normal}`,
                    },
                    ':active': {
                        // color: vars.color.foreground.primary,
                        textDecoration: 'underline',

                        textDecorationColor: vars.color.foreground.primary,
                    },
                }),
            ],
            true: layerStyle('components', {
                color: vars.color.foreground.primary,
            }),
        },
    },
});

export const icon = recipe({
    base: layerStyle('components', {
        color: vars.color.foreground.hint,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    }),

    defaultVariants: { size: 'md' },
    variants: {
        size: {
            sm: { width: vars.size.dimension[175], height: vars.size.dimension[175] },
            md: { width: vars.size.dimension[200], height: vars.size.dimension[200] },
            lg: { width: vars.size.dimension[200], height: vars.size.dimension[200] },
            xl: { width: vars.size.dimension[250], height: vars.size.dimension[250] },
        },
    },
});

export type BreadcrumbItemVariants = NonNullable<RecipeVariants<typeof link>>;
