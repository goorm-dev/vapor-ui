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
