import type { RecipeVariants } from '@vanilla-extract/recipes';

import { componentRecipe, componentStyle } from '~/styles/mixins/layer-style.css';
import { typography } from '~/styles/mixins/typography.css';
import { vars } from '~/styles/themes.css';

export const list = componentStyle({
    display: 'inline-flex',
    alignItems: 'center',
});

export const item = componentStyle({
    display: 'inline-flex',
    alignItems: 'center',
});

export const link = componentRecipe({
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
                {
                    color: vars.color.foreground.hint[100],

                    // NOTE: When the link interaction style is declared multiple times, consider separating it.
                    ':hover': {
                        textDecoration: 'underline',
                    },
                    ':focus-visible': {
                        outline: 'none',
                        boxShadow: `0 0 0 2px hsl(0, 0%, 100%), 0 0 0 4px ${vars.color.foreground.normal[200]}`,
                    },
                    ':active': {
                        textDecoration: 'underline',
                        textDecorationColor: vars.color.foreground.primary[100],
                    },
                },
            ],
            true: {
                color: vars.color.foreground.primary[100],
            },
        },
    },
});

export const icon = componentRecipe({
    base: {
        color: vars.color.foreground.hint[100],
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },

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
