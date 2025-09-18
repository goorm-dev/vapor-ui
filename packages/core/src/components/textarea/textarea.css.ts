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
            backgroundColor: vars.color.background.normal,
            color: vars.color.foreground.normal,
            width: '100%',
            minHeight: textareaMinHeightVar,
            resize: 'vertical',

            selectors: {
                '&:read-only': {
                    backgroundColor: vars.color.gray['050'],
                    resize: 'none',
                },
                '&::placeholder': {
                    color: vars.color.foreground.hint,
                },
            },
        }),
    ],

    defaultVariants: { invalid: false, size: 'md', resize: false, autoResize: false },

    variants: {
        invalid: {
            true: {
                borderColor: vars.color.border.danger,
            },
        },

        resize: {
            true: { resize: 'both' },
            false: { resize: 'none' },
        },

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

                // Ensure consistent scrollbar space
                selectors: {
                    // Always show scrollbar space to prevent width changes
                    '&': {
                        scrollbarWidth: 'auto',
                    },
                },
            },
            false: {},
        },

        size: {
            sm: [
                typography({ style: 'body3' }),
                {
                    padding: `${vars.size.space['050']} ${vars.size.space['100']}`,
                },
            ],
            md: [
                typography({ style: 'body2' }),
                {
                    padding: `${vars.size.space['075']} ${vars.size.space['150']}`,
                },
            ],
            lg: [
                typography({ style: 'body2' }),
                {
                    padding: `${vars.size.space['100']} ${vars.size.space['200']}`,
                },
            ],
            xl: [
                typography({ style: 'body1' }),
                {
                    padding: `${vars.size.space['175']} ${vars.size.space['300']}`,
                },
            ],
        },
    },
});

export type TextareaVariants = NonNullable<RecipeVariants<typeof textarea>>;
