import type { RecipeVariants } from '@vanilla-extract/recipes';
import { recipe } from '@vanilla-extract/recipes';

import { interaction } from '~/styles/mixins/interactions.css';
import { layerStyle } from '~/styles/mixins/layer-style.css';
import { typography } from '~/styles/mixins/typography.css';
import { vars } from '~/styles/themes.css';

/**
 * @variant size - Determines the size of the RadioCard.
 * @variant invalid - Determines whether the RadioCard is in an invalid state.
 */
export const root = recipe({
    base: [
        interaction(),
        typography({
            style: 'subtitle1',
        }),
        layerStyle('components', {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            boxShadow: `inset 0 0 0 1px ${vars.color.border.normal}`,
            borderRadius: vars.size.borderRadius[300],
            color: vars.color.foreground.normal[200],
            cursor: 'pointer',

            selectors: {
                '&[data-checked]': {
                    boxShadow: `inset 0 0 0 1px ${vars.color.border.primary}`,
                },
                '&[data-readonly]': {
                    backgroundColor: vars.color.gray['200'],
                },
                '&[data-disabled]': { opacity: 0.32, pointerEvents: 'none' },
                '&[data-invalid]': {
                    boxShadow: `inset 0 0 0 1px ${vars.color.border.danger}`,
                },
            },
        }),
    ],

    defaultVariants: {
        invalid: false,
        size: 'md',
    },

    variants: {
        /**
         * Determines whether the RadioCard is in an invalid state.
         */
        invalid: {
            true: {},
        },
        /**
         * Determines the size of the RadioCard.
         */
        size: {
            md: layerStyle('components', {
                height: vars.size.dimension['400'],
                paddingInline: vars.size.space['150'],
            }),
            lg: layerStyle('components', {
                height: vars.size.dimension['500'],
                paddingInline: vars.size.space['200'],
            }),
        },
    },
});

export type RadioCardVariants = NonNullable<RecipeVariants<typeof root>>;
