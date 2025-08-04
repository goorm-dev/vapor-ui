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
                    transition: 'text-decoration-color 0.2s ease-in-out',
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

export const icon = layerStyle('components', {
    color: vars.color.foreground.hint,
    display: 'block',
});

export type BreadcrumbItemVariants = NonNullable<RecipeVariants<typeof link>>;
