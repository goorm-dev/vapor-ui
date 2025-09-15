import { style } from '@vanilla-extract/css';
import type { RecipeVariants } from '@vanilla-extract/recipes';
import { recipe } from '@vanilla-extract/recipes';

import { foregrounds } from '~/styles/mixins/foreground.css';
import { interaction } from '~/styles/mixins/interactions.css';
import { typography } from '~/styles/mixins/typography.css';
import { layerStyle } from '~/styles/utils/layer-style.css';
import { vars } from '~/styles/vars.css';

export const root = recipe({
    base: layerStyle('components', {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: vars.size.space[100],
        width: '100%',
    }),

    defaultVariants: { disabled: false },

    variants: {
        disabled: {
            true: {
                opacity: 0.32,
                pointerEvents: 'none',
            },
        },
    },
});

export const input = recipe({
    base: [
        interaction({ type: 'form' }),

        layerStyle('components', {
            outline: 0,
            border: `0.0625rem solid ${vars.color.border.normal}`,
            borderRadius: vars.size.borderRadius['300'],
            backgroundColor: vars.color.background.normal,
            color: vars.color.foreground.normal,
            width: '100%',
            minHeight: '116px',
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

    defaultVariants: { invalid: false, size: 'md', resizing: false, autoResize: false },

    variants: {
        invalid: {
            true: {
                borderColor: vars.color.border.danger,
            },
        },

        resizing: {
            true: { resize: 'both' },
            false: { resize: 'none' },
        },

        autoResize: {
            true: {
                boxSizing: 'border-box',
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

export const count = style([
    typography({ style: 'body3' }),
    foregrounds({ color: 'hint' }),
    layerStyle('components', {
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
    }),
]);

export type RootVariants = NonNullable<RecipeVariants<typeof root>>;
export type InputVariants = NonNullable<RecipeVariants<typeof input>>;
