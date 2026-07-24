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

    defaultVariants: { size: 'md' },
    variants: {
        size: { sm: {}, md: {}, lg: {}, xl: {} },
    },
});

export const group = componentStyle({
    display: 'inline-flex',
    alignItems: 'center',
    gap: vars.size.space['050'],
});

export const button = componentStyle({
    // marginInline: vars.size.space['025'],
});

export const input = componentStyle({
    // marginInline: vars.size.space['025'],
});

export const separator = componentStyle({
    width: '0.0625rem',
    alignSelf: 'stretch',
    marginBlock: vars.size.space['050'],
    // marginInline: vars.size.space['025'],
    backgroundColor: vars.color.border.normal,
});

export type ToolbarRootVariants = NonNullable<RecipeVariants<typeof root>>;
