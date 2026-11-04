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
 * `css()` 결과물의 TypeScript 타입.
 *
 * 런타임 실체는 toString 이 심어진 object(property-key → atomic className map)
 * 지만, 타입 상으로는 string 으로 취급해 `className` 자리에 그대로 쓸 수 있도록
 * branded string 으로 노출한다. 두 층의 역할 분담:
 *
 * - TypeScript: `VaporClass` 를 `string` 과 intersection → `className` 승인
 * - 런타임: toString 이 자동 호출되어 실제 DOM 에는 "cls1 cls2 ..." 문자열 반영
 *
 * 추가 이점:
 * - template literal (`${a} ${b}`) 로 합성하면 결과 타입이 `string` 이 되어
 *   `brand` 가 소실 → plugin 단계에서 build error 로 잡기 쉬움.
 * - `css(a, b)` 머지 시 overload 가 `VaporClass` 를 받아 property-key 단위
 *   last-wins 보장 (뒤 argument 가 이김, StyleX 관례).
 */
declare const vaporClassBrand: unique symbol;
export type VaporClass = string & { readonly [vaporClassBrand]: true };
