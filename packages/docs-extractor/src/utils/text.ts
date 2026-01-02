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

/**
 * Convert kebab-case string to PascalCase
 * @example
 *   toPascalCase("dialog") → "Dialog"
 *   toPascalCase("input-group") → "InputGroup"
 */
export function toPascalCase(str: string): string {
    return str
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');
}

/**
 * Split a compound component name into base and sub-component parts
 * @example
 *   splitCompoundName("Dialog.Root") → { base: "Dialog", sub: "Root" }
 *   splitCompoundName("Button") → { base: "Button", sub: undefined }
 */
export function splitCompoundName(name: string): { base: string; sub?: string } {
    const parts = name.split('.');
    return {
        base: parts[0],
        sub: parts[1],
    };
}
