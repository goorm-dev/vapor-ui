import type { RecipeVariants } from '@vanilla-extract/recipes';

import { componentRecipe, componentStyle } from '~/styles/mixins/layer-style.css';
import { vars } from '~/styles/themes.css';

export const root = componentRecipe({
    base: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: vars.size.space['050'],

        padding: vars.size.space['050'],
    },

    defaultVariants: { variant: 'outline' },
    variants: {
        variant: {
            outline: {
                backgroundColor: vars.color.background.canvas[100],
                borderRadius: vars.size.borderRadius[400],
                border: '0.0625rem solid',
                borderColor: vars.color.border.normal,
            },
            ghost: {
                backgroundColor: 'transparent',
            },
        },
    },
});

export const group = componentStyle({
    display: 'inline-flex',
    alignItems: 'center',
    gap: vars.size.space['050'],
});

export const item = componentRecipe({
    base: {},
    defaultVariants: { size: 'md' },
    variants: {
        size: {
            sm: { height: vars.size.dimension['300'] },
            md: { height: vars.size.dimension['400'] },
            lg: { height: vars.size.dimension['500'] },
            xl: { height: vars.size.dimension['600'] },
        },
    },
});

export const separator = componentStyle({
    width: '0.0625rem',
    alignSelf: 'stretch',
    marginBlock: vars.size.space['050'],
    backgroundColor: vars.color.border.normal,
});

export type ToolbarRootVariants = NonNullable<RecipeVariants<typeof root>>;
export type ToolbarItemVariants = NonNullable<RecipeVariants<typeof item>>;
