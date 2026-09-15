/**
 * Type cleaner module
 *
 * Normalizes the type strings produced by the type printer: drops the `undefined`
 * that optional props add, removes duplicate union members, and unquotes a union
 * of string literals so documentation renders the bare values.
 */

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

function removeUndefined(type: string): string {
    return splitTopLevelUnion(type)
        .filter((p) => p !== 'undefined')
        .join(' | ');
}

/**
 * `"sm" | "md"` becomes `sm | md` — a union of string literals documents as its
 * bare values. Any other union is left exactly as it is.
 */
function unquoteStringLiteralUnion(type: string): string {
    const parts = splitTopLevelUnion(type);

    if (parts.length === 0 || !parts.every(isStringLiteral)) return type;

    return parts.map((part) => part.slice(1, -1)).join(' | ');
}

export function cleanType(type: string): string {
    const noEmpty = removeEmptyUnion(type);
    const cleaned = removeDuplicateTypes(noEmpty);

    return unquoteStringLiteralUnion(removeUndefined(cleaned));
}
