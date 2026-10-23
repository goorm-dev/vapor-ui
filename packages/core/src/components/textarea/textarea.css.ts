import { createVar } from '@vanilla-extract/css';
import type { RecipeVariants } from '@vanilla-extract/recipes';

import { interaction } from '~/styles/mixins/interactions.css';
import { componentRecipe } from '~/styles/mixins/layer-style.css';
import { when } from '~/styles/mixins/logical-states';
import { typography } from '~/styles/mixins/typography.css';
import { vars } from '~/styles/themes.css';

const boxShadowColor = createVar('box-shadow-color');

export const textarea = componentRecipe({
    base: [
        interaction({ type: 'form' }),

        {
            borderRadius: vars.size.borderRadius['300'],
            boxShadow: `inset 0 0 0 0.0625rem ${boxShadowColor}`,
            backgroundColor: vars.color.background['canvas-base'],
            width: '100%',
            color: vars.color.foreground['normal'],

            selectors: {
                '&::placeholder': { color: vars.color.foreground['hint'] },
                [when.invalid()]: { vars: { [boxShadowColor]: vars.color.border.danger } },
                [when.readonly()]: { backgroundColor: vars.color.gray['200'] },
                [when.disabled()]: { opacity: 0.32, pointerEvents: 'none' },
            },

            vars: { [boxShadowColor]: vars.color.border.normal },
        },
    ],

    defaultVariants: { invalid: false, size: 'md', autoResize: false },

    variants: {
        /**
         * Marks the textarea as invalid, applying error styles. Sets `aria-invalid` on the `<textarea>` element.
         */
        invalid: { true: {}, false: {} },
        /**
         * Grows the textarea's height to fit its content as the user types, and turns off manual resizing.
         */
        autoResize: {
            true: {
                resize: 'none',
                scrollbarWidth: 'auto',
                scrollbarGutter: 'stable',
            },
        },

        /**
         * Size of the textarea, controlling padding and typography.
         */
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
