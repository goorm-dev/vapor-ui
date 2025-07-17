import type { RecipeVariants } from '@vanilla-extract/recipes';
import { recipe } from '@vanilla-extract/recipes';

import { interaction } from '~/styles/mixins/interactions.css';
import { visuallyHidden } from '~/styles/mixins/visually-hidden.css';
import { layerStyle } from '~/styles/utils/layer-style.css';
import { vars } from '~/styles/vars.css';

export const root = recipe({
    base: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: vars.size.space[100],
        width: '100%',
    },

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

export const label = recipe({
    base: layerStyle('component', {
        lineHeight: vars.typography.lineHeight['050'],

        letterSpacing: vars.typography.letterSpacing['000'],
        color: vars.color.foreground['normal-lighter'],
        fontSize: vars.typography.fontSize['050'],
        fontWeight: vars.typography.fontWeight[500],
    }),

    defaultVariants: { visuallyHidden: false },
    variants: {
        visuallyHidden: { true: visuallyHidden },
    },
});

export const field = recipe({
    base: [
        interaction({ type: 'form' }),

        layerStyle('component', {
            outline: 0,
            border: `0.0625rem solid ${vars.color.border.normal}`,
            borderRadius: vars.size.borderRadius['300'],
            backgroundColor: vars.color.background.normal,
            paddingBlock: vars.size.space['000'],

            color: vars.color.foreground.normal,

            selectors: {
                '&:read-only': { backgroundColor: vars.color.gray['050'] },

                '&::placeholder': { color: vars.color.foreground.hint },
                '&::-webkit-search-cancel-button': { display: 'none' },
            },
        }),
    ],

    defaultVariants: { invalid: false, size: 'md' },

    variants: {
        invalid: {
            true: {
                borderColor: vars.color.border.danger,
            },
        },

        size: {
            sm: {
                paddingInline: vars.size.space[100],
                height: vars.size.dimension['300'],
                fontSize: vars.typography.fontSize['050'],
            },
            md: {
                paddingInline: vars.size.space[150],
                height: vars.size.dimension['400'],
                fontSize: vars.typography.fontSize['075'],
            },
            lg: {
                paddingInline: vars.size.space[200],
                height: vars.size.dimension['500'],
                fontSize: vars.typography.fontSize['075'],
            },
            xl: {
                paddingInline: vars.size.space[300],
                height: vars.size.dimension['600'],
                fontSize: vars.typography.fontSize['100'],
            },
        },
    },
});

export type RootVariants = NonNullable<RecipeVariants<typeof root>>;
export type LabelVariants = NonNullable<RecipeVariants<typeof label>>;
export type FieldVariants = NonNullable<RecipeVariants<typeof field>>;
