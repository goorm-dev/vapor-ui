import { createVar, fallbackVar, globalStyle, style } from '@vanilla-extract/css';
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
                // invalid 는 Root prop 이 아니라 자식 컨트롤의 aria-invalid 로만 켠다(시각 = 테두리).
                [when.invalid(`&:has([aria-invalid='true'])`)]: {
                    vars: { [boxShadowColor]: vars.color.border.danger },
                },
                [`${when.readonly()}`]: { backgroundColor: vars.color.gray['200'] },
                [`${DISABLED}`]: { opacity: 0.32 },
            },
        },
    ],

    defaultVariants: { size: 'md', disabled: false, readOnly: false },

    variants: {
        disabled: { true: {}, false: {} },
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
                    [compactButtonSize]: vars.size.dimension['350'],
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

const HAS_PADDED_CONTROL = `&:has(button, [role='combobox'])`;
const SELECT_TRIGGER = `[role='combobox']`;

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

// InputGroup.Input 이 렌더 대상(기본 TextInput)에 얹는 로컬 클래스.
// 컨트롤을 naked화(자체 테두리·배경 제거)하고 그룹 높이에 맞춘다 — 그룹의 포커스 링은 Root 의
// form-within 이 그리므로 컨트롤 자신의 boxShadow 는 지운다.
// utilities 레이어로 컨트롤 자신의 스타일(components 레이어)을 이긴다 — button 과 동일 패턴.
export const input = style({
    '@layer': {
        [layers.utilities]: {
            flex: 1,
            opacity: 1,
            boxShadow: 'none',
            backgroundColor: 'transparent',
            paddingInline: vars.size.space['050'],
            minWidth: 0,
            height: inputHeight,
            fontSize: 'inherit',
        },
    },
});

// InputGroup.Button 이 렌더 대상(Button/IconButton/Select.Trigger)에 얹는 로컬 클래스.
// 시각 밀도에 맞춰 높이를 그룹 기준으로 누른다. Select.Trigger 로 편입될 때만(role=combobox)
// naked화해 그룹의 addon 처럼 녹아들게 한다 — 일반 Button/IconButton 은 자기 시각을 유지.
// utilities 레이어로 컨트롤 자신의 스타일(components 레이어)을 이긴다.
export const button = style({
    '@layer': {
        [layers.utilities]: {
            height: compactButtonSize,
            minHeight: compactButtonSize,
            selectors: {
                [`&${SELECT_TRIGGER}`]: {
                    boxShadow: 'none',
                    backgroundColor: 'transparent',
                    paddingInline: vars.size.space['050'],
                },
            },
        },
    },
});

// icon-button 아이콘을 그룹 밀도에 맞춘다(sm/md 16, lg 20, xl 24). icon-button 의
// max(16px,50%)(components 레이어)를 utilities 로 덮는다. 앵커가 button 로컬 클래스라
// 그룹 밖으로 전파되지 않는다. Select.Trigger(combobox) 는 chevron 을 자체 렌더하므로 제외.
globalStyle(`${button}:not(${SELECT_TRIGGER}) > :is(svg, img)`, {
    '@layer': {
        [layers.utilities]: {
            width: compactIconSize,
            height: compactIconSize,
        },
    },
});
