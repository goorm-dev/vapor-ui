import { createVar } from '@vanilla-extract/css';
import type { RecipeVariants } from '@vanilla-extract/recipes';

import { foregrounds } from '~/styles/mixins/foreground.css';
import { interaction } from '~/styles/mixins/interactions.css';
import { componentRecipe, componentStyle } from '~/styles/mixins/layer-style.css';
import { when } from '~/styles/mixins/logical-states';
import { typography } from '~/styles/mixins/typography.css';
import { vars } from '~/styles/themes.css';

const boxShadowColor = createVar('box-shadow-color');
const hintColor = createVar('hint-color');

export const inputGroup = componentRecipe({
    base: [
        interaction({ type: 'form', within: true }),
        {
            display: 'flex',
            alignItems: 'center',

            borderRadius: vars.size.borderRadius['300'],
            boxShadow: `inset 0 0 0 0.0625rem ${boxShadowColor}`,

            backgroundColor: vars.color.background['canvas-base'],
            width: '100%',

            selectors: {
                [when.invalid()]: { vars: { [boxShadowColor]: vars.color.border.danger } },

                [when.readonly()]: {
                    backgroundColor: vars.color.gray['200'],
                    vars: { [hintColor]: vars.color.foreground['secondary'] },
                },

                [when.disabled()]: { opacity: 0.32, pointerEvents: 'none' },
            },

            vars: {
                [boxShadowColor]: vars.color.border.normal,
                [hintColor]: vars.color.foreground['hint'],
            },
        },
    ],

    defaultVariants: { size: 'md', invalid: false },
    variants: {
        /**
         * Size of the combobox, controlling height, padding, typography, and icon size.
         */
        size: {
            sm: {
                gap: vars.size.space['100'],
                paddingInline: vars.size.space['100'],
                height: vars.size.dimension['300'],
            },
            md: {
                gap: vars.size.space['100'],
                paddingInline: vars.size.space['150'],
                height: vars.size.dimension['400'],
            },
            lg: {
                gap: vars.size.space['100'],
                paddingInline: vars.size.space['200'],
                height: vars.size.dimension['500'],
            },
            xl: {
                gap: vars.size.space['150'],
                paddingInline: vars.size.space['300'],
                height: vars.size.dimension['600'],
            },
        },

        /**
         * Marks the combobox as invalid, applying error styles. Sets `aria-invalid` on the `<input>` element.
         */
        invalid: { true: {}, false: {} },
    },
});

export const input = componentRecipe({
    base: [
        foregrounds({ color: 'normal' }),
        {
            flex: 1,
            outline: 0,
            border: 0,
            backgroundColor: 'transparent',
            padding: 0,
            minWidth: 0,
            height: '100%',

            selectors: {
                '&::placeholder': { color: hintColor },
            },
        },
    ],

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

export const iconButton = componentRecipe({
    base: {
        display: 'flex',
        flexShrink: 0,
        alignItems: 'center',
        justifyContent: 'center',

        border: 0,

        backgroundColor: 'transparent',
        cursor: 'pointer',
        padding: 0,
        color: hintColor,
    },

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
    foregrounds({ color: 'normal' }),
    {
        display: 'flex',
        flexShrink: 0,
        marginInlineStart: 'auto',
        width: vars.size.dimension['200'],
        height: vars.size.dimension['200'],
    },
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

    backgroundColor: vars.color.background['canvas-overlay'],
    padding: vars.size.space['050'],
    minWidth: 'var(--anchor-width)',
    maxHeight: 'var(--available-height)',

    selectors: {
        '&[data-starting-style], &[data-ending-style]': {
            transform: 'scale(0.95)',
            opacity: 0,
        },
    },
});

export const list = componentStyle({
    flex: 1,
    outline: 0,
    minHeight: 0,
    overflowY: 'auto',
    overscrollBehavior: 'contain',
});

export const item = componentStyle([
    interaction({ type: 'roving' }),
    typography({ style: 'body2' }),
    foregrounds({ color: 'normal' }),
    {
        display: 'flex',
        alignItems: 'center',
        gap: vars.size.space['050'],

        borderRadius: vars.size.borderRadius['300'],

        cursor: 'default',

        paddingBlock: vars.size.space['050'],
        paddingInline: vars.size.space['150'],
        height: vars.size.dimension['400'],

        selectors: {
            [when.disabled()]: { opacity: 0.32, pointerEvents: 'none' },
        },
    },
]);

export const groupLabel = componentStyle([
    typography({ style: 'subtitle2' }),
    foregrounds({ color: 'hint' }),
    {
        paddingTop: vars.size.space['100'],
        paddingBottom: vars.size.space['050'],
        paddingInline: vars.size.space['150'],
    },
]);

export const separator = componentStyle({
    flexShrink: 0,
    marginBlock: vars.size.space['050'],
    backgroundColor: vars.color.border.normal,
    height: '0.0625rem',
});

export const empty = componentStyle([
    typography({ style: 'body2' }),
    foregrounds({ color: 'hint' }),
    {
        paddingBlock: vars.size.space['050'],
        paddingInline: vars.size.space['150'],
    },
]);

export type InputGroupVariants = NonNullable<RecipeVariants<typeof inputGroup>>;
