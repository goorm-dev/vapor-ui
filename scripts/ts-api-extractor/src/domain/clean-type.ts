/**
 * Type cleaner module
 *
 * Normalizes the type strings produced by the type printer: drops the `undefined`
 * that optional props add, removes duplicate union members, and splits a union of
 * string literals into the list of values documentation renders as a table cell.
 */

export interface TypeCleanResult {
    type: string;
    values?: string[];
}

/**
 * Split top-level union only. Ignores | inside parentheses/braces.
 */
export function splitTopLevelUnion(type: string): string[] {
    const parts: string[] = [];
    let current = '';
    let depth = 0;

    for (let i = 0; i < type.length; i++) {
        const char = type[i];
        const prevChar = i > 0 ? type[i - 1] : '';

        if (char === '(' || char === '{' || char === '[') {
            depth++;
            current += char;
        } else if (char === '<') {
            depth++;
            current += char;
        } else if (char === ')' || char === '}' || char === ']') {
            depth--;
            current += char;
        } else if (char === '>') {
            // The '>' of an arrow function is not a closing angle bracket.
            if (prevChar !== '=') {
                depth--;
            }
            current += char;
        } else if (char === '|' && depth === 0) {
            parts.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }

    if (current.trim()) {
        parts.push(current.trim());
    }

    return parts;
}

function removeEmptyUnion(type: string): string {
    return splitTopLevelUnion(type).filter(Boolean).join(' | ');
}

function removeDuplicateTypes(type: string): string {
    const parts = splitTopLevelUnion(type);
    const unique = [...new Set(parts)];
    return unique.join(' | ');
}

function isStringLiteral(part: string): boolean {
    const trimmed = part.trim();
    return trimmed.startsWith('"') && trimmed.endsWith('"');
}

function extractStringValue(literal: string): string {
    return literal.trim().slice(1, -1);
}

function removeUndefined(type: string): string {
    return splitTopLevelUnion(type)
        .filter((p) => p !== 'undefined')
        .join(' | ');
}

function extractUnionValues(type: string): TypeCleanResult {
    const cleanedType = removeUndefined(type);
    const parts = splitTopLevelUnion(cleanedType);
    const stringLiterals = parts.filter(isStringLiteral);

    if (stringLiterals.length === parts.length && stringLiterals.length > 0) {
        return { type: cleanedType, values: stringLiterals.map(extractStringValue) };
    }

    return { type: cleanedType, values: parts.length > 0 ? parts : undefined };
}

export function cleanType(type: string): TypeCleanResult {
    const noEmpty = removeEmptyUnion(type);
    const cleaned = removeDuplicateTypes(noEmpty);

    return extractUnionValues(cleaned);
}
