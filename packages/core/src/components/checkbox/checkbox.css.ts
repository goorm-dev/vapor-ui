import type { RecipeVariants } from '@vanilla-extract/recipes';
import { recipe } from '@vanilla-extract/recipes';

import { interaction } from '~/styles/mixins/interactions.css';
import { typography } from '~/styles/mixins/typography.css';
import { visuallyHidden } from '~/styles/mixins/visually-hidden.css';
import { layerStyle } from '~/styles/utils/layer-style.css';
import { vars } from '~/styles/vars.css';

export const root = recipe({
    base: layerStyle('components', {
        display: 'inline-flex',
        alignItems: 'center',
        gap: vars.size.space[100],
        verticalAlign: 'middle',
    }),

    defaultVariants: { disabled: false },
    variants: {
        disabled: {
            true: layerStyle('components', { opacity: 0.32, pointerEvents: 'none' }),
        },
    },
});

export const label = recipe({
    base: [
        typography({ style: 'body2' }),
        layerStyle('components', { color: vars.color.foreground.normal }),
    ],

    defaultVariants: { visuallyHidden: false },
    variants: {
        visuallyHidden: {
            true: visuallyHidden,
        },
    },
});

export const control = recipe({
    base: [
        interaction(),
        layerStyle('components', {
            position: 'relative',

            display: 'flex',
            flexShrink: 0,
            alignItems: 'center',
            justifyContent: 'center',
            gap: vars.size.space[100],

            border: '0.0625rem solid',
            borderColor: vars.color.border.normal,

            backgroundColor: vars.color.background['normal-darker'],
            padding: vars.size.space['000'],

            selectors: {
                '&[data-checked], &[data-indeterminate]': {
                    backgroundColor: vars.color.background.primary,
                },
            },
        }),
    ],

    defaultVariants: {
        invalid: false,
        size: 'md',
    },

    variants: {
        invalid: {
            true: layerStyle('components', { borderColor: vars.color.border.danger }),
        },

        size: {
            md: layerStyle('components', {
                borderRadius: vars.size.borderRadius[100],
                width: vars.size.dimension[200],
                height: vars.size.dimension[200],
            }),
            lg: layerStyle('components', {
                borderRadius: vars.size.borderRadius[200],
                width: vars.size.dimension[300],
                height: vars.size.dimension[300],
            }),
        },
    },
});

export const indicator = recipe({
    base: layerStyle('components', {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: vars.color.white,
    }),

    defaultVariants: { size: 'md' },
    variants: {
        size: {
            md: layerStyle('components', {
                width: vars.size.dimension[100],
                height: vars.size.dimension[100],
            }),
            lg: layerStyle('components', {
                width: vars.size.dimension[150],
                height: vars.size.dimension[150],
            }),
        },
    },
});

export type RootVariants = NonNullable<RecipeVariants<typeof root>>;
export type ControlVariants = NonNullable<RecipeVariants<typeof control>>;
export type LabelVariants = NonNullable<RecipeVariants<typeof label>>;
