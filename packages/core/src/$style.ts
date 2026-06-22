export type StyleTokenValue = `$${string}`;
export type StyleValue = string | number | StyleTokenValue;

export type SupportedProperty =
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
    | 'columnGap'
    | 'width'
    | 'height'
    | 'minWidth'
    | 'minHeight'
    | 'maxWidth'
    | 'maxHeight'
    | 'color'
    | 'backgroundColor'
    | 'borderColor'
    | 'borderRadius'
    | 'boxShadow'
    | 'display'
    | 'position'
    | 'overflow'
    | 'opacity';

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

export type ConditionRecord = Partial<Record<ConditionKey, StyleValue>>;

export type StyleInput = Partial<Record<SupportedProperty, StyleValue | ConditionRecord>>;

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
