import { style } from '@vanilla-extract/css';
import type { RecipeVariants } from '@vanilla-extract/recipes';
import { recipe } from '@vanilla-extract/recipes';

import { foregrounds } from '~/styles/mixins/foreground.css';
import { interaction } from '~/styles/mixins/interactions.css';
import { typography } from '~/styles/mixins/typography.css';
import { vars } from '~/styles/vars.css';

export const trigger = recipe({
    base: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: vars.size.space['100'],

        border: `1px solid ${vars.color.border.normal}`,
        borderRadius: vars.size.borderRadius['300'],

        backgroundColor: vars.color.background['normal-lighter'],

        selectors: {
            '&:disabled': { opacity: 0.32, pointerEvents: 'none' },
            '&[data-readonly]': { backgroundColor: vars.color.gray['200'] },
        },
    },

    defaultVariants: { size: 'md', invalid: false },
    variants: {
        size: {
            sm: { paddingInline: vars.size.space['100'], height: vars.size.space['300'] },
            md: { paddingInline: vars.size.space['150'], height: vars.size.space['400'] },
            lg: { paddingInline: vars.size.space['200'], height: vars.size.space['500'] },
            xl: { paddingInline: vars.size.space['300'], height: vars.size.space['600'] },
        },
        invalid: {
            true: { borderColor: vars.color.border.danger },
        },
    },
});

export const value = style([typography({ style: 'body2' }), foregrounds({ color: 'normal' })]);

export const placeholder = style([typography({ style: 'body2' }), foregrounds({ color: 'hint' })]);

export const icon = style({ display: 'flex' });

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
