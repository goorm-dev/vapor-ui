import type * as CSS from 'csstype';

import type {
    BorderRadiusToken,
    ColorToken,
    DimensionToken,
    ShadowToken,
    SpaceToken,
} from './$style.tokens.generated';

export type StyleTokenValue = `$${string}`;

export type SpaceProperty =
    | 'padding'
    | 'paddingTop'
    | 'paddingBottom'
    | 'paddingLeft'
    | 'paddingRight'
    | 'paddingX'
    | 'paddingY'
    | 'margin'
    | 'marginTop'
    | 'marginBottom'
    | 'marginLeft'
    | 'marginRight'
    | 'marginX'
    | 'marginY'
    | 'gap'
    | 'rowGap'
    | 'columnGap';

export type DimensionProperty = 'width' | 'height' | 'minWidth' | 'minHeight' | 'maxWidth' | 'maxHeight';

export type ColorProperty = 'color' | 'backgroundColor' | 'borderColor';

export type BorderRadiusProperty = 'borderRadius';

export type ShadowProperty = 'boxShadow';

export type PseudoCondition =
    | '_before'
    | '_after'
    | '_hover'
    | '_focus'
    | '_focusVisible'
    | '_focusWithin'
    | '_active';

export type BreakpointCondition = 'sm' | 'md' | 'lg';

export type ConditionKey = 'default' | BreakpointCondition | PseudoCondition | `@media ${string}`;

// `string & {}` preserves literal-token autocomplete while accepting any string.
type LiteralString = string & Record<never, never>;

// Sugar props (paddingX/Y, marginX/Y) are NOT real CSS — typed via overlay.
type SugarValue = SpaceToken | LiteralString | number;

interface SugarProperties {
    paddingX?: SugarValue;
    paddingY?: SugarValue;
    marginX?: SugarValue;
    marginY?: SugarValue;
}

// Per-property value overlay: token union + native CSS value
type ValueOverlay<P extends string, V> = P extends SpaceProperty
    ? SpaceToken | V
    : P extends DimensionProperty
      ? DimensionToken | V
      : P extends ColorProperty
        ? ColorToken | V
        : P extends BorderRadiusProperty
          ? BorderRadiusToken | V
          : P extends ShadowProperty
            ? ShadowToken | V
            : V;

// Replace number-only types with LiteralString fallback so '$token' stays valid.
type WithLiteralFallback<V> = V extends string
    ? V | LiteralString
    : V extends number
      ? V | LiteralString
      : V | LiteralString;

type CSSEntry<P extends keyof CSS.Properties> = WithLiteralFallback<NonNullable<CSS.Properties[P]>>;

type CSSStyleInput = {
    [P in keyof CSS.Properties]?:
        | ValueOverlay<P, CSSEntry<P>>
        | ConditionRecord<ValueOverlay<P, CSSEntry<P>>>;
};

type SugarStyleInput = {
    [P in keyof SugarProperties]?:
        | NonNullable<SugarProperties[P]>
        | ConditionRecord<NonNullable<SugarProperties[P]>>;
};

export type ConditionRecord<V = LiteralString | number> = Partial<Record<ConditionKey, V>>;

export type StyleInput = CSSStyleInput & SugarStyleInput;

export type SupportedProperty =
    | SpaceProperty
    | DimensionProperty
    | ColorProperty
    | BorderRadiusProperty
    | ShadowProperty
    | keyof CSS.Properties;

export type StyleValue = LiteralString | number;

export type { ColorToken, SpaceToken, DimensionToken, BorderRadiusToken, ShadowToken };

/**
 * Build-time macro. `@vapor-ui/style-macro/unplugin` rewrites every call site of this
 * function into a literal class-name string and emits the corresponding atomic CSS.
 *
 * If you see this body executing at runtime, the macro is not configured in your
 * bundler — install `@vapor-ui/style-macro/unplugin` per the migration guide.
 */
export function $style(_input: StyleInput): string {
    if (
        typeof console !== 'undefined' &&
        typeof process !== 'undefined' &&
        process.env?.NODE_ENV !== 'production'
    ) {
        console.warn(
            '[@vapor-ui/core] $style was called at runtime — your bundler is missing @vapor-ui/style-macro/unplugin. Returning empty string.',
        );
    }
    return '';
}
