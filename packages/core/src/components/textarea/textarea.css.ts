import { createVar } from '@vanilla-extract/css';
import type { RecipeVariants } from '@vanilla-extract/recipes';

import { interaction } from '~/styles/mixins/interactions.css';
import { componentRecipe } from '~/styles/mixins/layer-style.css';
import { typography } from '~/styles/mixins/typography.css';
import { vars } from '~/styles/themes.css';

const borderColor = createVar('border-color');

export const textarea = componentRecipe({
    base: [
        interaction({ type: 'form' }),

        {
            boxShadow: `inset 0 0 0 0.0625rem ${borderColor}`,
            borderRadius: vars.size.borderRadius['300'],
            backgroundColor: vars.color.background.overlay[100],
            color: vars.color.foreground.normal[200],
            width: '100%',

            selectors: {
                '&[data-disabled]': { pointerEvents: 'none', opacity: 0.32 },
                '&[data-readonly]': { backgroundColor: vars.color.gray['200'] },
                '&[data-invalid]': { vars: { [borderColor]: vars.color.border.danger } },
                '&::placeholder': { color: vars.color.foreground.hint[100] },
            },

            vars: { [borderColor]: vars.color.border.normal },
        },
    ],

    defaultVariants: { invalid: false, size: 'md', autoResize: false },

    variants: {
        invalid: { true: {}, false: {} },
        autoResize: {
            true: {
                resize: 'none',
                scrollbarWidth: 'auto',
                scrollbarGutter: 'stable',
            },
        },

        size: {
            sm: [
                typography({ style: 'body3' }),
                {
                    paddingBlock: vars.size.space['050'],
                    paddingInline: vars.size.space['100'],
                },
            ],
            md: [
                typography({ style: 'body2' }),
                {
                    paddingBlock: vars.size.space['075'],
                    paddingInline: vars.size.space['150'],
                },
            ],
            lg: [
                typography({ style: 'body2' }),
                {
                    paddingBlock: vars.size.space['100'],
                    paddingInline: vars.size.space['200'],
                },
            ],
            xl: [
                typography({ style: 'body1' }),
                {
                    paddingBlock: vars.size.space['175'],
                    paddingInline: vars.size.space['300'],
                },
            ],
        },
    },
});

export type TextareaVariants = NonNullable<RecipeVariants<typeof textarea>>;
