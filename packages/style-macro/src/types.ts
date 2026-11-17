import type { Properties as CSSProperties } from 'csstype';

import type { PropertyToTokenAxis, Tokens } from '~/tokens';

type LooseString = string & {};
type LooseNumber = number & {};

type TokenValue<P extends keyof CSSProperties> = P extends keyof PropertyToTokenAxis
    ? PropertyToTokenAxis[P] extends keyof Tokens
        ? `$${string & keyof Tokens[PropertyToTokenAxis[P]]}`
        : never
    : never;

type Value<P extends keyof CSSProperties> =
    | (P extends keyof PropertyToTokenAxis ? TokenValue<P> : CSSProperties[P])
    | LooseString
    | LooseNumber;

export type NestedKey = `:${string}` | `::${string}` | `@${string}` | `[${string}]` | `&${string}`;

export type StyleObject = {
    [P in keyof CSSProperties]?: Value<P>;
} & {
    [K in NestedKey]?: StyleObject;
} & {
    [K in `--${string}`]?: string | number;
};

/**
 * `css()` 결과물의 TypeScript 타입. 런타임 실체도 string 이다.
 *
 * brand 는 `css()` 결과와 일반 문자열을 타입 단계에서 구분한다. template literal
 * (`${a} ${b}`)·`cn()` 으로 이어 붙이면 병합되지 않고 승패가 CSS 로드 순서를 따른다 —
 * 속성 단위 last-wins 를 원하면 `css(a, b)` 로 합성한다.
 */
declare const vaporClassBrand: unique symbol;
export type VaporClass = string & { readonly [vaporClassBrand]: true };
