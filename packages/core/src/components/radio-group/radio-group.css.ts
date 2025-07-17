import type { RecipeVariants } from '@vanilla-extract/recipes';
import { recipe } from '@vanilla-extract/recipes';

import { interaction } from '~/styles/mixins/interactions.css';
import { visuallyHidden } from '~/styles/mixins/visually-hidden.css';
import { layerStyle } from '~/styles/utils/layer-style.css';
import { vars } from '~/styles/vars.css';

export const root = recipe({
    base: layerStyle('vapor-component', {
        display: 'flex',
    }),

    defaultVariants: { orientation: 'vertical' },
    variants: {
        size: {
            md: layerStyle('vapor-component', { gap: vars.size.space['050'] }),
            lg: layerStyle('vapor-component', { gap: vars.size.space['100'] }),
        },
        orientation: {
            horizontal: layerStyle('vapor-component', { flexDirection: 'row' }),
            vertical: layerStyle('vapor-component', { flexDirection: 'column' }),
        },
    },
});

export const item = recipe({
    base: layerStyle('vapor-component', {
        display: 'flex',
        flexShrink: 0,
        alignItems: 'center',

        gap: vars.size.space['100'],
    }),

    defaultVariants: { disabled: false },
    variants: {
        disabled: { true: layerStyle('vapor-component', { opacity: 0.32, pointerEvents: 'none' }) },
    },
});

export const control = recipe({
    base: [
        interaction(),
        layerStyle('vapor-component', {
            position: 'relative',

            display: 'flex',
            flexShrink: 0,
            alignItems: 'center',
            justifyContent: 'center',
            gap: vars.size.space[100],

            border: `0.0625rem solid ${vars.color.border.normal}`,
            borderRadius: 9999,

            backgroundColor: vars.color.background.normal,
            cursor: 'pointer',

            padding: vars.size.space['000'],

            selectors: {
                '&[data-state="checked"]': {
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
            true: layerStyle('vapor-component', { borderColor: vars.color.background['danger'] }),
        },

        size: {
            md: layerStyle('vapor-component', {
                width: vars.size.dimension[200],
                height: vars.size.dimension[200],
            }),
            lg: layerStyle('vapor-component', {
                width: vars.size.dimension[300],
                height: vars.size.dimension[300],
            }),
        },
    },
});

export const indicator = layerStyle('vapor-component', {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    border: 'none',
    borderRadius: '9999px',
    backgroundColor: vars.color.background.normal,
    width: '50%',
    height: '50%',
});

export const label = recipe({
    base: layerStyle('vapor-component', {
        lineHeight: vars.typography.lineHeight['075'],

        letterSpacing: vars.typography.letterSpacing['100'],
        color: vars.color.foreground['normal'],
        fontSize: vars.typography.fontSize['075'],
        fontWeight: vars.typography.fontWeight[400],
    }),

    defaultVariants: { visuallyHidden: false },
    variants: {
        visuallyHidden: {
            true: visuallyHidden,
        },
    },
});

export type RootVariants = NonNullable<RecipeVariants<typeof root>>;
export type ItemVariants = NonNullable<RecipeVariants<typeof item>>;
export type ControlVariants = NonNullable<RecipeVariants<typeof control>>;
export type LabelVariants = NonNullable<RecipeVariants<typeof label>>;
