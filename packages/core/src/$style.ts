export type StyleTokenValue = `$${string}`;
export type StyleValue = string | number | StyleTokenValue;

export interface ConditionRecord {
    default?: StyleValue;
    sm?: StyleValue;
    md?: StyleValue;
    lg?: StyleValue;
    _before?: StyleValue;
    _after?: StyleValue;
    _hover?: StyleValue;
    _focus?: StyleValue;
    _focusVisible?: StyleValue;
    _focusWithin?: StyleValue;
    _active?: StyleValue;
    [rawMedia: `@media ${string}`]: StyleValue | undefined;
}

export type StyleInput = Record<string, StyleValue | ConditionRecord>;

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
