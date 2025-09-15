import { style } from '@vanilla-extract/css';
import type { RecipeVariants } from '@vanilla-extract/recipes';
import { recipe } from '@vanilla-extract/recipes';

import { foregrounds } from '~/styles/mixins/foreground.css';
import { interaction } from '~/styles/mixins/interactions.css';
import { typography } from '~/styles/mixins/typography.css';
import { vars } from '~/styles/vars.css';

export const trigger = recipe({
    base: [
        interaction(),
        {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',

            border: `1px solid ${vars.color.border.normal}`,
            borderRadius: vars.size.borderRadius['300'],

            backgroundColor: vars.color.background['normal-lighter'],

            selectors: {
                '&:disabled': { opacity: 0.32, pointerEvents: 'none' },
                '&[data-readonly]': { backgroundColor: vars.color.gray['200'] },
            },
        },
    ],

    defaultVariants: { size: 'md', invalid: false },
    variants: {
        size: {
            sm: {
                gap: vars.size.space['100'],
                paddingInline: vars.size.space['100'],
                height: vars.size.space['300'],
            },
            md: {
                gap: vars.size.space['100'],
                paddingInline: vars.size.space['150'],
                height: vars.size.space['400'],
            },
            lg: {
                gap: vars.size.space['100'],
                paddingInline: vars.size.space['200'],
                height: vars.size.space['500'],
            },
            xl: {
                gap: vars.size.space['150'],
                paddingInline: vars.size.space['300'],
                height: vars.size.space['600'],
            },
        },
        invalid: {
            true: { borderColor: vars.color.border.danger },
        },
    },
});

export const value = recipe({
    base: foregrounds({ color: 'normal' }),

    defaultVariants: { size: 'md' },
    variants: {
        size: {
            sm: typography({ style: 'body3' }),
            md: typography({ style: 'body2' }),
            lg: typography({ style: 'body2' }),
            xl: typography({ style: 'body1' }),
        },
    },
});

export const placeholder = style([foregrounds({ color: 'hint' })]);

export const triggerIcon = recipe({
    base: [foregrounds({ color: 'hint' }), { display: 'flex' }],

    defaultVariants: { size: 'md' },
    variants: {
        size: {
            sm: { width: vars.size.dimension['200'], height: vars.size.dimension['200'] },
            md: { width: vars.size.dimension['200'], height: vars.size.dimension['200'] },
            lg: { width: vars.size.dimension['250'], height: vars.size.dimension['250'] },
            xl: { width: vars.size.dimension['300'], height: vars.size.dimension['300'] },
        },
    },
});

export const itemIndicator = style([foregrounds({ color: 'normal' }), { display: 'flex' }]);

export const popup = style({
    display: 'flex',
    flexDirection: 'column',

    transformOrigin: 'var(--transform-origin)',
    transition: 'transform 150ms, opacity 150ms',

    border: `1px solid ${vars.color.border.normal}`,
    borderRadius: vars.size.borderRadius['300'],

    boxShadow: vars.shadow.md,

    backgroundColor: vars.color.background['normal'],
    padding: vars.size.space['050'],
    minWidth: 'max(var(--anchor-width), 12.5rem)',

    selectors: {
        '&[data-starting-style], &[data-ending-style]': {
            transform: 'scale(0.95)',
            opacity: 0,
        },
    },
});

export const item = [
    interaction({ type: 'roving' }),
    typography({ style: 'body2' }),
    style({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: vars.size.space['100'],

        borderRadius: vars.size.borderRadius['300'],

        cursor: 'default',

        paddingBlock: vars.size.space['050'],
        paddingInline: vars.size.space['100'],
        height: vars.size.space['400'],
    }),
];

export const separator = style({
    flexShrink: 0,
    marginBlock: vars.size.space['050'],
    backgroundColor: vars.color.border.normal,
    height: '0.0625rem',
});

export const groupLabel = style([
    typography({ style: 'subtitle2' }),
    foregrounds({ color: 'hint' }),
    {
        paddingTop: vars.size.space['100'],
        paddingRight: vars.size.space['050'],
        paddingBottom: vars.size.space['050'],
        paddingLeft: vars.size.space['100'],
    },
]);

export type TriggerVariants = NonNullable<RecipeVariants<typeof trigger>>;
