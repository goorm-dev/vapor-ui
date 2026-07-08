import { createVar, globalStyle } from '@vanilla-extract/css';

import { layers } from '~/styles/layers.css';
import { componentStyle } from '~/styles/mixins/layer-style.css';
import { when } from '~/styles/mixins/logical-states';
import { vars } from '~/styles/themes.css';

/* -------------------------------------------------------------------------------------------------
 * Root — 시각 박스. 테두리·배경·radius·focus 링을 소유한다. 자식 입력은 naked화되어 이 껍데기에 동화된다.
 *
 * 상태 트리거(설계 §4.2):
 *   - focus  = `:focus-within` (자식 포커스가 네이티브로 전파됨)
 *   - invalid = Root prop `data-invalid`  OR  Field발 `:has([aria-invalid='true'])`
 *   - disabled = Root prop `data-disabled`  OR  Field발 `:has(:disabled)`
 *   - readonly = Root prop `data-readonly`
 * 우선순위 disabled > readonly > invalid 는 logical-states 의 :not 체인으로 유지한다.
 *
 * focus/hover 링 값은 text-input 의 interaction({type:'form'}) 에서 복제한다.
 * interaction 은 `&:focus` 기준이라 `:focus-within` 패턴에 그대로 못 쓴다 —
 * 원본이 바뀌면 여기도 같이 고칠 것. (원본: styles/mixins/interactions.css.ts, type: 'form')
 * -----------------------------------------------------------------------------------------------*/

const boxShadowColor = createVar('input-group-box-shadow-color');

// Root prop 또는 Field(aria-invalid)로 들어오는 invalid 를 하나로 묶는다.
const INVALID = `&[data-invalid], &:has([aria-invalid='true'])`;
// Root prop 또는 Field(:disabled)로 들어오는 disabled.
const DISABLED = `&[data-disabled], &:has(:disabled)`;

export const root = componentStyle({
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
        // focus 링 — interaction form 의 &:focus 값 복제
        '&:focus-within': { vars: { [boxShadowColor]: vars.color.border.primary } },

        // invalid 테두리 — readonly/disabled 아닐 때만 (logical-states 우선순위와 동일).
        // :focus-within 규칙보다 소스 순서가 뒤라 focus 중에도 danger 가 우선한다.
        [`${when.invalid(INVALID)}`]: { vars: { [boxShadowColor]: vars.color.border.danger } },

        // readonly 배경
        [`${when.readonly()}`]: { backgroundColor: vars.color.gray['200'] },

        // disabled 감광 — pointerEvents 는 건드리지 않는다(슬롯 버튼 클릭 가능해야 함).
        // 입력 차단은 자식에 직접 지정된 disabled 가 담당.
        [`${DISABLED}`]: { opacity: 0.32 },
    },
});

// hover 링은 media query 안에서만 — selectors 객체에 직접 못 넣어 globalStyle 로 뺀다.
globalStyle(`${root}:hover:not(:focus-within)`, {
    '@media': {
        '(hover: hover)': {
            boxShadow: `inset 0 0 0 0.0625rem color-mix(in srgb, ${vars.color.gray[900]} 32%, transparent)`,
        },
    },
});

/* -------------------------------------------------------------------------------------------------
 * size — Root 자신의 레이아웃(높이·좌우 여백·글자 크기)만 결정한다. 자식 상태와 무관.
 * layerRecipe variant 를 셀렉터 키로 쓰면 prod dist 에서 런타임 클래스와 갈라진다 —
 * 명시 sizeClass 상수로 둔다.
 * -----------------------------------------------------------------------------------------------*/

const sm = componentStyle({
    height: vars.size.dimension['300'],
    paddingInline: vars.size.space[100],
    fontSize: vars.typography.fontSize['050'],
});
const md = componentStyle({
    height: vars.size.dimension['400'],
    paddingInline: vars.size.space[150],
    fontSize: vars.typography.fontSize['075'],
});
const lg = componentStyle({
    height: vars.size.dimension['500'],
    paddingInline: vars.size.space[200],
    fontSize: vars.typography.fontSize['075'],
});
const xl = componentStyle({
    height: vars.size.dimension['600'],
    paddingInline: vars.size.space[300],
    fontSize: vars.typography.fontSize['100'],
});

export const sizeClass = { sm, md, lg, xl } as const;
export type InputGroupSize = keyof typeof sizeClass;

/* -------------------------------------------------------------------------------------------------
 * Addon 슬롯 — 부가요소를 감싼다. 자기 여백은 없고, 회색 텍스트/아이콘 색만 준다(label addon 용).
 * -----------------------------------------------------------------------------------------------*/

export const leadingAddon = componentStyle({
    display: 'inline-flex',
    alignItems: 'center',
    color: vars.color.foreground.hint[100],
});

export const trailingAddon = componentStyle({
    display: 'inline-flex',
    alignItems: 'center',
    color: vars.color.foreground.hint[100],
});

/* -------------------------------------------------------------------------------------------------
 * naked 화 — 그룹 안 입력 컨트롤(TextInput/Textarea)의 테두리·배경·좌우여백을 벗겨 Root 에 동화시킨다.
 * 자식 css.ts 는 건드리지 않는다. utilities 레이어 후손 오버라이드가 전담(자식 recipe 보다 뒤 레이어).
 * -----------------------------------------------------------------------------------------------*/

// utilities 레이어에 두어 자식 recipe(vapor.components)를 명시적으로 이긴다.
globalStyle(`${root} :is(input, textarea)`, {
    '@layer': {
        [layers.utilities]: {
            flex: 1,
            // 자식의 disabled 감광이 Root 감광과 이중으로 겹치지 않게 중화 — 감광은 Root 가 한 번만.
            opacity: 1,
            boxShadow: 'none',
            backgroundColor: 'transparent',
            paddingInline: 0,
        },
    },
});

// 자식 자신의 focus/hover 링(box-shadow)도 그룹 안에서는 죽인다 — 링은 Root 소유.
globalStyle(`${root} :is(input, textarea):is(:focus, :hover)`, {
    '@layer': {
        [layers.utilities]: { boxShadow: 'none' },
    },
});
