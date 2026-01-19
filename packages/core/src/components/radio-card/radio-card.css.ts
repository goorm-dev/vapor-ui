import type { RecipeVariants } from '@vanilla-extract/recipes';
import { recipe } from '@vanilla-extract/recipes';

import { interaction } from '~/styles/mixins/interactions.css';
import { layerStyle } from '~/styles/mixins/layer-style.css';
import { vars } from '~/styles/themes.css';

export const root = recipe({
    base: [
        interaction(),
        layerStyle('components', {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            boxShadow: `inset 0 0 0 1px ${vars.color.border.normal}`,
            borderRadius: vars.size.borderRadius[300],
            color: vars.color.foreground.normal[200],
            cursor: 'pointer',
            paddingBlock: '0.3125rem',
            paddingInline: vars.size.space['150'],

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
    },

    variants: {
        invalid: {
            true: {},
        },
    },
});

export type RadioCardVariants = NonNullable<RecipeVariants<typeof root>>;
