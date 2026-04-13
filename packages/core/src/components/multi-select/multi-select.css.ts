import type { RecipeVariants } from '@vanilla-extract/recipes';

import { foregrounds } from '~/styles/mixins/foreground.css';
import { interaction } from '~/styles/mixins/interactions.css';
import { componentRecipe, componentStyle } from '~/styles/mixins/layer-style.css';
import { typography } from '~/styles/mixins/typography.css';
import { vars } from '~/styles/themes.css';

export const trigger = componentRecipe({
    base: [
        interaction(),
        {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',

            boxShadow: `inset 0 0 0 1px ${vars.color.border.normal}`,
            borderRadius: vars.size.borderRadius['300'],

            width: '100%',

            backgroundColor: vars.color.background.overlay[100],

            selectors: {
                '&[data-invalid]': { boxShadow: `inset 0 0 0 1px ${vars.color.border.danger}` },

                '&[data-readonly]': { backgroundColor: vars.color.gray['200'] },
                '&[data-readonly]:active::before': { opacity: 0.08 },

                '&[data-disabled]': { opacity: 0.32, pointerEvents: 'none' },
            },
        },
    ],

    defaultVariants: { size: 'md', invalid: false },
    variants: {
        size: {
            sm: {
                gap: vars.size.space['100'],
                paddingInline: vars.size.space['100'],
            },
            md: {
                gap: vars.size.space['100'],
                paddingInline: vars.size.space['150'],
            },
            lg: {
                gap: vars.size.space['100'],
                paddingInline: vars.size.space['200'],
            },
            xl: {
                gap: vars.size.space['150'],
                paddingInline: vars.size.space['300'],
            },
        },

        invalid: { true: {}, false: {} },
    },
});

export const value = componentRecipe({
    base: [
        foregrounds({ color: 'normal-200' }),
        {
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: vars.size.space['050'],

            selectors: {
                '&[data-placeholder]': { color: vars.color.foreground.hint[100] },
            },
        },
    ],

    defaultVariants: { size: 'md' },
    variants: {
        size: {
            sm: [
                typography({ style: 'body3' }),
                {
                    paddingBlock: vars.size.space['025'],
                    minHeight: vars.size.space['300'],
                },
            ],
            md: [
                typography({ style: 'body2' }),
                {
                    paddingBlock: vars.size.space['050'],
                    minHeight: vars.size.space['400'],
                },
            ],
            lg: [
                typography({ style: 'body2' }),
                {
                    paddingBlock: vars.size.space['100'],
                    minHeight: vars.size.space['500'],
                },
            ],
            xl: [
                typography({ style: 'body1' }),
                {
                    paddingBlock: vars.size.space['100'],
                    minHeight: vars.size.space['600'],
                },
            ],
        },
    },
});

/**
 * @deprecated Use `data-placeholder` attribute on `MultiSelect.Value` instead.
 */
export const placeholder = componentRecipe({
    base: foregrounds({ color: 'hint-100' }),

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

const icon = componentStyle({ display: 'flex', flexShrink: 0 });

export const triggerIcon = componentRecipe({
    base: [foregrounds({ color: 'hint-100' }), icon],

    defaultVariants: { size: 'md' },
    variants: {
        size: {
            sm: {
                width: vars.size.dimension['200'],
                height: vars.size.dimension['200'],
            },
            md: {
                width: vars.size.dimension['200'],
                height: vars.size.dimension['200'],
            },
            lg: {
                width: vars.size.dimension['250'],
                height: vars.size.dimension['250'],
            },
            xl: {
                width: vars.size.dimension['300'],
                height: vars.size.dimension['300'],
            },
        },
    },
});

export const itemIndicator = componentStyle([
    foregrounds({ color: 'normal-200' }),
    icon,
    { width: vars.size.dimension['200'], height: vars.size.dimension['200'] },
]);

export const positioner = componentStyle({
    position: 'relative',
});

export const popup = componentStyle({
    display: 'flex',
    flexDirection: 'column',

    transformOrigin: 'var(--transform-origin)',
    transition: 'transform 150ms, opacity 150ms',

    border: `1px solid ${vars.color.border.normal}`,
    borderRadius: vars.size.borderRadius['300'],
    boxShadow: vars.shadow.md,
    backgroundColor: vars.color.background.overlay[100],

    padding: vars.size.space['050'],
    minWidth: 'max(var(--anchor-width), 12.5rem)',

    selectors: {
        '&[data-starting-style], &[data-ending-style]': {
            transform: 'scale(0.95)',
            opacity: 0,
        },
    },
});

export const item = componentStyle([
    interaction({ type: 'roving' }),
    typography({ style: 'body2' }),
    {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: vars.size.space['050'],

        borderRadius: vars.size.borderRadius['300'],

        paddingBlock: vars.size.space['050'],
        paddingInline: vars.size.space['100'],
        height: vars.size.space['400'],
    },
]);

export const separator = componentStyle({
    flexShrink: 0,
    marginBlock: vars.size.space['050'],
    backgroundColor: vars.color.border.normal,
    height: '0.0625rem',
});

export const groupLabel = componentStyle([
    typography({ style: 'subtitle2' }),
    foregrounds({ color: 'hint-100' }),
    {
        paddingTop: vars.size.space['100'],
        paddingRight: vars.size.space['050'],
        paddingBottom: vars.size.space['050'],
        paddingLeft: vars.size.space['100'],
    },
]);

export type TriggerVariants = NonNullable<RecipeVariants<typeof trigger>>;
