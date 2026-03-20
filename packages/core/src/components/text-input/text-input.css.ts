import { createVar } from '@vanilla-extract/css';
import type { RecipeVariants } from '@vanilla-extract/recipes';

import { interaction } from '~/styles/mixins/interactions.css';
import { componentRecipe } from '~/styles/mixins/layer-style.css';
import { vars } from '~/styles/themes.css';

const borderColor = createVar('border-color');

export const root = componentRecipe({
    base: [
        interaction({ type: 'form' }),

        {
            outline: 0,
            boxShadow: `inset 0 0 0 0.0625rem ${borderColor}`,
            borderRadius: vars.size.borderRadius['300'],
            backgroundColor: vars.color.background.canvas[100],
            paddingBlock: vars.size.space['000'],

            color: vars.color.foreground.normal[200],

            selectors: {
                '&[data-disabled]': { pointerEvents: 'none', opacity: 0.32 },
                '&[data-readonly]': { backgroundColor: vars.color.gray['200'] },
                '&[data-invalid]': { vars: { [borderColor]: vars.color.border.danger } },
                '&::placeholder': { color: vars.color.foreground.hint[100] },
                '&::-webkit-search-cancel-button': { display: 'none' },
            },

            vars: { [borderColor]: vars.color.border.normal },
        },
    ],

    defaultVariants: { invalid: false, size: 'md' },

    variants: {
        invalid: { true: {}, false: {} },

        size: {
            sm: {
                paddingInline: vars.size.space[100],
                height: vars.size.dimension['300'],
                fontSize: vars.typography.fontSize['050'],
            },
            md: {
                paddingInline: vars.size.space[150],
                height: vars.size.dimension['400'],
                fontSize: vars.typography.fontSize['075'],
            },
            lg: {
                paddingInline: vars.size.space[200],
                height: vars.size.dimension['500'],
                fontSize: vars.typography.fontSize['075'],
            },
            xl: {
                paddingInline: vars.size.space[300],
                height: vars.size.dimension['600'],
                fontSize: vars.typography.fontSize['100'],
            },
        },
    },
});

export type RootVariants = NonNullable<RecipeVariants<typeof root>>;
