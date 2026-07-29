import { createVar } from '@vanilla-extract/css';
import type { RecipeVariants } from '@vanilla-extract/recipes';

import { interaction } from '~/styles/mixins/interactions.css';
import { componentRecipe } from '~/styles/mixins/layer-style.css';
import { when } from '~/styles/mixins/logical-states';
import { vars } from '~/styles/themes.css';

const boxShadowColor = createVar('box-shadow-color');

export const root = componentRecipe({
    base: [
        interaction(),
        {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: vars.size.borderRadius[300],
            boxShadow: `inset 0 0 0 1px ${boxShadowColor}`,
            cursor: 'pointer',
            paddingBlock: '0.3125rem',
            paddingInline: vars.size.space['150'],
            textAlign: 'center',
            color: vars.color.foreground.normal[200],

            selectors: {
                '&[data-checked]': { vars: { [boxShadowColor]: vars.color.border.primary } },
                [when.invalid()]: { vars: { [boxShadowColor]: vars.color.border.danger } },
                [when.readonly()]: { backgroundColor: vars.color.gray['200'] },
                [when.disabled()]: { opacity: 0.32, pointerEvents: 'none' },
            },

            vars: { [boxShadowColor]: vars.color.border.normal },
        },
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
