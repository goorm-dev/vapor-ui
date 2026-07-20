import type { RecipeVariants } from '@vanilla-extract/recipes';

import { componentRecipe, componentStyle } from '~/styles/mixins/layer-style.css';
import { vars } from '~/styles/themes.css';

export const root = componentRecipe({
    base: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: vars.size.space['050'],

        padding: vars.size.space['050'],

        borderRadius: vars.size.borderRadius['400'],
        border: '1px solid',
        borderColor: vars.color.border.normal,
        backgroundColor: vars.color.background.canvas[100],
    },

    defaultVariants: { size: 'md', variant: 'default' },
    variants: {
        size: { sm: {}, md: {}, lg: {}, xl: {} },
        variant: { default: {}, accent: {} },
    },
});

export const separator = componentStyle({
    width: '0.0625rem',
    alignSelf: 'stretch',
    marginBlock: vars.size.space['050'],
    backgroundColor: vars.color.border.normal,
});

export type ToggleGroupVariants = NonNullable<RecipeVariants<typeof root>>;
