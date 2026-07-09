import { createVar, fallbackVar, globalStyle } from '@vanilla-extract/css';
import type { RecipeVariants } from '@vanilla-extract/recipes';

import { layers } from '~/styles/layers.css';
import { componentRecipe, componentStyle } from '~/styles/mixins/layer-style.css';
import { when } from '~/styles/mixins/logical-states';
import { vars } from '~/styles/themes.css';

const boxShadowColor = createVar('input-group-box-shadow-color');

const compactButtonSize = createVar('input-group-compact-button-size');
const compactIconSize = createVar('input-group-compact-icon-size');
const inputHeight = createVar('input-group-input-height');
const addonGap = createVar('input-group-addon-gap');

const INVALID = `&[data-invalid], &:has([aria-invalid='true'])`;
const DISABLED = `&[data-disabled], &:has(:disabled)`;

export const root = componentRecipe({
    base: {
        display: 'flex',
        alignItems: 'center',
        width: '100%',

        borderRadius: vars.size.borderRadius['300'],
        backgroundColor: vars.color.background.canvas[100],
        boxShadow: `inset 0 0 0 0.0625rem ${boxShadowColor}`,
        color: vars.color.foreground.normal[200],
        transition: 'box-shadow 150ms cubic-bezier(.4,0,.2,1)',

        vars: { [boxShadowColor]: vars.color.border.normal },

        selectors: {
            '&:focus-within': { vars: { [boxShadowColor]: vars.color.border.primary } },

            [`${when.invalid(INVALID)}`]: { vars: { [boxShadowColor]: vars.color.border.danger } },

            [`${when.readonly()}`]: { backgroundColor: vars.color.gray['200'] },

            [`${DISABLED}`]: { opacity: 0.32 },
        },

        '@media': {
            '(hover: hover)': {
                selectors: {
                    '&:hover:not(:focus-within)': {
                        boxShadow: `inset 0 0 0 0.0625rem color-mix(in srgb, ${vars.color.gray[900]} 32%, transparent)`,
                    },
                },
            },
        },
    },

    defaultVariants: { size: 'md', disabled: false, invalid: false, readOnly: false },

    variants: {
        // 아래 3개는 타입 소스일 뿐 — 실제 스타일은 base 의 data-*/:has 셀렉터가 담당한다.
        disabled: { true: {}, false: {} },
        invalid: { true: {}, false: {} },
        readOnly: { true: {}, false: {} },

        size: {
            sm: {
                height: vars.size.dimension['300'],
                paddingInline: vars.size.space['050'],
                fontSize: vars.typography.fontSize['050'],
                vars: {
                    [compactButtonSize]: '1.5rem',
                    [compactIconSize]: '1rem',
                    [inputHeight]: vars.size.dimension['300'],
                    [addonGap]: vars.size.space['000'],
                },
            },
            md: {
                height: vars.size.dimension['400'],
                paddingInline: vars.size.space[100],
                fontSize: vars.typography.fontSize['075'],
                vars: {
                    [compactButtonSize]: '1.5rem',
                    [compactIconSize]: '1rem',
                    [inputHeight]: vars.size.dimension['400'],
                    [addonGap]: vars.size.space['000'],
                },
            },
            lg: {
                height: vars.size.dimension['500'],
                paddingInline: vars.size.space[150],
                fontSize: vars.typography.fontSize['075'],
                vars: {
                    [compactButtonSize]: '1.75rem',
                    [compactIconSize]: '1.25rem',
                    [inputHeight]: vars.size.dimension['500'],
                    [addonGap]: vars.size.space['000'],
                },
            },
            xl: {
                height: vars.size.dimension['600'],
                paddingInline: vars.size.space[250],
                fontSize: vars.typography.fontSize['100'],
                vars: {
                    [compactButtonSize]: '2rem',
                    [compactIconSize]: '1.5rem',
                    [inputHeight]: vars.size.dimension['600'],
                    [addonGap]: vars.size.space['050'],
                },
            },
        },
    },
});

export type RootVariants = NonNullable<RecipeVariants<typeof root>>;
export type InputGroupSize = NonNullable<RootVariants['size']>;

const rootBase = root.classNames.base;

const HAS_PADDED_CONTROL = `&:has(button, [role='combobox'])`;

export const addon = componentStyle({
    display: 'inline-flex',
    alignItems: 'center',
    gap: fallbackVar(addonGap, vars.size.space[100]),
    color: vars.color.foreground.hint[100],
    paddingInline: vars.size.space['050'],
    selectors: {
        [HAS_PADDED_CONTROL]: { paddingInline: vars.size.space['000'] },
    },
});

globalStyle(`${rootBase} :is(input, textarea)`, {
    '@layer': {
        [layers.utilities]: {
            flex: 1,
            opacity: 1,
            boxShadow: 'none',
            backgroundColor: 'transparent',
            paddingInline: vars.size.space['050'],
            fontSize: 'inherit',
        },
    },
});

globalStyle(`${rootBase} :is(input, textarea):is(:focus, :hover)`, {
    '@layer': {
        [layers.utilities]: { boxShadow: 'none' },
    },
});

globalStyle(`${rootBase} input`, {
    '@layer': {
        [layers.utilities]: { height: inputHeight },
    },
});

const ICON_BUTTON = `button:not([role='combobox'])`;
const SELECT_TRIGGER = `[role='combobox']`;

globalStyle(`${rootBase} ${ICON_BUTTON}`, {
    '@layer': {
        [layers.utilities]: {
            width: compactButtonSize,
            height: compactButtonSize,
            minHeight: compactButtonSize,
        },
    },
});
globalStyle(`${rootBase} ${ICON_BUTTON} > :is(svg, img)`, {
    '@layer': {
        [layers.utilities]: {
            width: compactIconSize,
            height: compactIconSize,
        },
    },
});

globalStyle(`${rootBase} ${SELECT_TRIGGER}`, {
    '@layer': {
        [layers.utilities]: {
            boxShadow: 'none',
            backgroundColor: 'transparent',
            paddingInline: vars.size.space['050'],
        },
    },
});
