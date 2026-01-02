/**
 * String utility functions
 */

/**
 * Converts kebab-case to PascalCase.
 * @example "avatar" -> "Avatar", "text-input" -> "TextInput"
 */
export const kebabToPascal = (str: string): string => {
    return str
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');
};
