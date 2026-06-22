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

export type PlainProperty = 'display' | 'position' | 'overflow' | 'opacity';

export type SupportedProperty =
    | SpaceProperty
    | DimensionProperty
    | ColorProperty
    | BorderRadiusProperty
    | ShadowProperty
    | PlainProperty;

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

// `string & {}` keeps the literal-token union visible to autocomplete
// while still allowing plain CSS strings like 'flex'.
type LiteralString = string & Record<never, never>;

type ValueFor<P extends SupportedProperty> = P extends SpaceProperty
    ? SpaceToken | LiteralString | number
    : P extends DimensionProperty
      ? DimensionToken | LiteralString | number
      : P extends ColorProperty
        ? ColorToken | LiteralString
        : P extends BorderRadiusProperty
          ? BorderRadiusToken | LiteralString | number
          : P extends ShadowProperty
            ? ShadowToken | LiteralString
            : LiteralString | number;

export type StyleValue = SpaceToken | DimensionToken | ColorToken | string | number;

export type ConditionRecord<V = StyleValue> = Partial<Record<ConditionKey, V>>;

export type StyleInput = {
    [P in SupportedProperty]?: ValueFor<P> | ConditionRecord<ValueFor<P>>;
};

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
