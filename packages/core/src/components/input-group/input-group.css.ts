import { createVar, fallbackVar, globalStyle } from '@vanilla-extract/css';
import type { RecipeVariants } from '@vanilla-extract/recipes';

import { layers } from '~/styles/layers.css';
import { interaction } from '~/styles/mixins/interactions.css';
import { componentRecipe, componentStyle } from '~/styles/mixins/layer-style.css';
import { when } from '~/styles/mixins/logical-states';
import { vars } from '~/styles/themes.css';

const boxShadowColor = createVar('box-shadow-color');

const compactButtonSize = createVar('input-group-compact-button-size');
const compactIconSize = createVar('input-group-compact-icon-size');
const inputHeight = createVar('input-group-input-height');
const addonGap = createVar('input-group-addon-gap');

const INVALID = `&[data-invalid], &:has([aria-invalid='true'])`;
const DISABLED = `&[data-disabled], &:has(:disabled)`;

export const root = componentRecipe({
    base: [
        // focus-within(primary 링)·hover(회색 링)·transition 은 form-within 이 담당한다.
        interaction({ type: 'form-within' }),

        {
            display: 'flex',
            alignItems: 'center',
            width: '100%',

            borderRadius: vars.size.borderRadius['300'],
            backgroundColor: vars.color.background.canvas[100],
            boxShadow: `inset 0 0 0 0.0625rem ${boxShadowColor}`,
            color: vars.color.foreground.normal[200],

            vars: { [boxShadowColor]: vars.color.border.normal },

            selectors: {
                [`${when.invalid(INVALID)}`]: {
                    vars: { [boxShadowColor]: vars.color.border.danger },
                },
                [`${when.readonly()}`]: { backgroundColor: vars.color.gray['200'] },
                [`${DISABLED}`]: { opacity: 0.32 },
            },
        },
    ],

    defaultVariants: { size: 'md', disabled: false, invalid: false, readOnly: false },

    variants: {
        disabled: { true: {}, false: {} },
        invalid: { true: {}, false: {} },
        readOnly: { true: {}, false: {} },

        size: {
            sm: {
                height: vars.size.dimension['300'],
                paddingInline: vars.size.space['050'],
                fontSize: vars.typography.fontSize['050'],
                vars: {
                    [compactButtonSize]: vars.size.dimension['300'],
                    [compactIconSize]: vars.size.dimension['200'],
                    [inputHeight]: vars.size.dimension['300'],
                    [addonGap]: vars.size.space['000'],
                },
            },
            md: {
                height: vars.size.dimension['400'],
                paddingInline: vars.size.space[100],
                fontSize: vars.typography.fontSize['075'],
                vars: {
                    [compactButtonSize]: vars.size.dimension['300'],
                    [compactIconSize]: vars.size.dimension['200'],
                    [inputHeight]: vars.size.dimension['400'],
                    [addonGap]: vars.size.space['000'],
                },
            },
            lg: {
                height: vars.size.dimension['500'],
                paddingInline: vars.size.space[150],
                fontSize: vars.typography.fontSize['075'],
                vars: {
                    // ponytail: 28px는 dimension 토큰에 없음(24↔32 공백). 토큰 추가는 별도 논의.
                    [compactButtonSize]: '1.75rem',
                    [compactIconSize]: vars.size.dimension['250'],
                    [inputHeight]: vars.size.dimension['500'],
                    [addonGap]: vars.size.space['000'],
                },
            },
            xl: {
                height: vars.size.dimension['600'],
                paddingInline: vars.size.space[250],
                fontSize: vars.typography.fontSize['100'],
                vars: {
                    [compactButtonSize]: vars.size.dimension['400'],
                    [compactIconSize]: vars.size.dimension['300'],
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

globalStyle(`${addon} > :is(svg, img)`, {
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
