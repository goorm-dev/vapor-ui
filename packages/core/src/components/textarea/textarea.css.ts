import { createGlobalVar } from '@vanilla-extract/css';
import type { RecipeVariants } from '@vanilla-extract/recipes';
import { recipe } from '@vanilla-extract/recipes';

import { interaction } from '~/styles/mixins/interactions.css';
import { typography } from '~/styles/mixins/typography.css';
import { layerStyle } from '~/styles/utils/layer-style.css';
import { vars } from '~/styles/vars.css';

export const textareaMinHeightVar = createGlobalVar('vapor-textarea-min-height');
export const textareaMaxHeightVar = createGlobalVar('vapor-textarea-max-height');

export const textarea = recipe({
    base: [
        interaction({ type: 'form' }),

        layerStyle('components', {
            outline: 0,
            border: `0.0625rem solid ${vars.color.border.normal}`,
            borderRadius: vars.size.borderRadius['300'],
            backgroundColor: vars.color.background.canvas,
            color: vars.color.foreground.normal[200],
            width: '100%',
            minHeight: textareaMinHeightVar,

            selectors: {
                '&:read-only': {
                    backgroundColor: vars.color.gray['050'],
                    resize: 'none',
                },
                '&::placeholder': {
                    color: vars.color.foreground.hint[100],
                },
            },
        }),
    ],

    defaultVariants: { invalid: false, size: 'md', autoResize: false },

    variants: {
        /** Use the invalid prop to indicate validation errors */
        invalid: {
            true: {
                borderColor: vars.color.border.danger,
            },
        },
        /** Use the autoResize prop to enable automatic height adjustment */
        autoResize: {
            true: {
                boxSizing: 'border-box',
                minHeight: textareaMinHeightVar,
                maxHeight: textareaMaxHeightVar,
                overflowX: 'hidden',
                overflowY: 'auto',
                resize: 'none',
                scrollbarGutter: 'stable',
                verticalAlign: 'top',

                selectors: {
                    '&': {
                        scrollbarWidth: 'auto',
                    },
                },
            },
            false: {},
        },

        /** Use the size prop to change the size of the textarea */
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
