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
 * brand 를 얹는 이유는 template literal (`${a} ${b}`) 합성을 타입 단계에서
 * 구분하기 위해서다 — 그 경로는 선언 슬롯 단위 last-wins 머지를 건너뛰므로
 * plugin 이 build error 로 잡는다. `css(a, b)` 로 합성하면 보장된다.
 */
declare const vaporClassBrand: unique symbol;
export type VaporClass = string & { readonly [vaporClassBrand]: true };
