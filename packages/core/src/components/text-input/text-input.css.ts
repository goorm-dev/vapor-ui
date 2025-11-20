import type { RecipeVariants } from '@vanilla-extract/recipes';
import { recipe } from '@vanilla-extract/recipes';

import { interaction } from '~/styles/mixins/interactions.css';
import { layerStyle } from '~/styles/mixins/layer-style.css';
import { vars } from '~/styles/themes.css';

export const root = recipe({
    base: [
        interaction({ type: 'form' }),

        layerStyle('components', {
            outline: 0,
            border: `0.0625rem solid ${vars.color.border.normal}`,
            borderRadius: vars.size.borderRadius['300'],
            backgroundColor: vars.color.background.overlay[100],
            paddingBlock: vars.size.space['000'],

            color: vars.color.foreground.normal[200],

            selectors: {
                '&[data-disabled]': { pointerEvents: 'none', opacity: 0.32 },
                '&[data-readonly]': { backgroundColor: vars.color.gray['200'] },
                '&[data-invalid]': { borderColor: vars.color.border.danger },
                '&::placeholder': { color: vars.color.foreground.hint[100] },
                '&::-webkit-search-cancel-button': { display: 'none' },
            },
        }),
    ],

    defaultVariants: { invalid: false, size: 'md' },

    variants: {
        invalid: { true: {}, false: {} },

        size: {
            sm: layerStyle('components', {
                paddingInline: vars.size.space[100],
                height: vars.size.dimension['300'],
                fontSize: vars.typography.fontSize['050'],
            }),
            md: layerStyle('components', {
                paddingInline: vars.size.space[150],
                height: vars.size.dimension['400'],
                fontSize: vars.typography.fontSize['075'],
            }),
            lg: layerStyle('components', {
                paddingInline: vars.size.space[200],
                height: vars.size.dimension['500'],
                fontSize: vars.typography.fontSize['075'],
            }),
            xl: layerStyle('components', {
                paddingInline: vars.size.space[300],
                height: vars.size.dimension['600'],
                fontSize: vars.typography.fontSize['100'],
            }),
        },
    },
});

export type RootVariants = NonNullable<RecipeVariants<typeof root>>;
