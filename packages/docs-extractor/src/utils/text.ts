/**
 * Text utility functions for docs-extractor
 */

/**
 * Convert PascalCase or camelCase string to kebab-case
 * @example
 *   toKebabCase("Dialog") → "dialog"
 *   toKebabCase("InputGroup") → "input-group"
 *   toKebabCase("NavigationMenu") → "navigation-menu"
 */
export function toKebabCase(str: string): string {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}
