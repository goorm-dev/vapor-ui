import type { RecipeVariants } from '@vanilla-extract/recipes';
import { recipe } from '@vanilla-extract/recipes';

import { interaction } from '~/styles/mixins/interactions.css';
import { layerStyle } from '~/styles/utils/layer-style.css';
import { vars } from '~/styles/vars.css';

export const root = recipe({
    base: layerStyle('components', {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
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
            padding: vars.size.space['150'],
            width: '260px',
            height: '114px',

            color: vars.color.foreground.normal,
            fontSize: vars.typography.fontSize['075'],
            lineHeight: vars.typography.lineHeight['075'],
            fontFamily: vars.typography.fontFamily.sans,

            selectors: {
                '&:read-only': {
                    backgroundColor: vars.color.gray['050'],
                    resize: 'none',
                },

                '&::placeholder': { color: vars.color.foreground.hint },
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
                overflow: 'hidden',
                resize: 'none',
            },
            false: {},
        },

        size: {
            sm: {
                padding: `${vars.size.space['050']} ${vars.size.space['100']}`,
                minHeight: vars.size.dimension['500'],
                fontSize: vars.typography.fontSize['025'],
            },
            md: {
                padding: `${vars.size.space['075']} ${vars.size.space['150']}`,
                minHeight: vars.size.dimension['600'],
                fontSize: vars.typography.fontSize['050'],
            },
            lg: {
                padding: `${vars.size.space['100']} ${vars.size.space['200']}`,
                minHeight: vars.size.dimension['700'],
                fontSize: vars.typography.fontSize['050'],
            },
            xl: {
                padding: `${vars.size.space['175']} ${vars.size.space['300']}`,
                minHeight: vars.size.dimension['800'],
                fontSize: vars.typography.fontSize['075'],
            },
        },
    },
});

export type RootVariants = NonNullable<RecipeVariants<typeof root>>;
export type InputVariants = NonNullable<RecipeVariants<typeof input>>;
