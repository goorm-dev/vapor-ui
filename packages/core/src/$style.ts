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
    | 'margin'
    | 'marginTop'
    | 'marginBottom'
    | 'marginLeft'
    | 'marginRight'
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

type CSSProps = CSS.Properties<string | number>;

type TokenOverlay<P> = P extends SpaceProperty
    ? SpaceToken
    : P extends DimensionProperty
      ? DimensionToken
      : P extends ColorProperty
        ? ColorToken
        : P extends BorderRadiusProperty
          ? BorderRadiusToken
          : P extends ShadowProperty
            ? ShadowToken
            : never;

type ValueFor<P> = P extends keyof CSSProps
    ? TokenOverlay<P> | NonNullable<CSSProps[P]>
    : TokenOverlay<P> | string | number;

export type ConditionRecord<V = string | number> = Partial<Record<ConditionKey, V>>;

// Sugar props (paddingX/Y, marginX/Y) not in csstype.
interface SugarProperties {
    paddingX?: SpaceToken | string | number;
    paddingY?: SpaceToken | string | number;
    marginX?: SpaceToken | string | number;
    marginY?: SpaceToken | string | number;
}

export type StyleInput = {
    [P in keyof CSSProps]?: ValueFor<P> | ConditionRecord<ValueFor<P>>;
} & {
    [P in keyof SugarProperties]?:
        | NonNullable<SugarProperties[P]>
        | ConditionRecord<NonNullable<SugarProperties[P]>>;
};

export type SupportedProperty = keyof CSSProps | keyof SugarProperties;

export type StyleValue = string | number;

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
