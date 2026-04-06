/**
 * Type cleaner module
 *
 * Simplifies callback types with Component.State and compresses large unions.
 */

const STATE_MARKER = '.State)';
const GENERIC_STATE_PATTERN = /,\s*[^,<>]*\.State(?:>|\))/g;

export interface TypeCleanResult {
    type: string;
    values?: string[];
}

export function containsStateCallback(type: string): boolean {
    return type.includes(STATE_MARKER);
}

export function simplifyStateCallback(type: string): string {
    if (!containsStateCallback(type)) return type;

    return splitTopLevelUnion(type)
        .map((part) => {
            if (!part.includes(STATE_MARKER)) return part;
            const match = part.match(/=>\s*(\w+)\)?$/);
            return match ? match[1] : part;
        })
        .join(' | ');
}

function removeEmptyUnion(type: string): string {
    return splitTopLevelUnion(type).filter(Boolean).join(' | ');
}

function removeDuplicateTypes(type: string): string {
    const parts = splitTopLevelUnion(type);
    const unique = [...new Set(parts)];
    return unique.join(' | ');
}

function removeGenericState(type: string): string {
    return type.replace(GENERIC_STATE_PATTERN, (match) => {
        return match.endsWith('>') ? '>' : ')';
    });
}

function simplifyRenderType(type: string): TypeCleanResult | null {
    if (!type.includes('ComponentRenderFn')) return null;
    return {
        type: 'ReactElement | ((props: HTMLProps) => ReactElement)',
        values: ['ReactElement', '(props: HTMLProps) => ReactElement'],
    };
}

/**
 * Clean render prop type by removing state parameter.
 */
function cleanRenderPropType(type: string): string {
    let cleaned = type.replace(
        /\(props:\s*HTMLProps(?:<[^>]*>)?,\s*state:\s*[^)]*\)\s*=>\s*ReactElement/g,
        '(props: HTMLProps) => ReactElement',
    );

    cleaned = cleaned.replace(
        /\(props:\s*HTMLProps<[^>]*>\)\s*=>\s*ReactElement/g,
        '(props: HTMLProps) => ReactElement',
    );

    return cleaned;
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
    const renderResult = simplifyRenderType(type);
    if (renderResult) {
        return renderResult;
    }

    const noGenericState = removeGenericState(type);
    const simplified = simplifyStateCallback(noGenericState);
    const renderCleaned = cleanRenderPropType(simplified);
    const noEmpty = removeEmptyUnion(renderCleaned);
    const cleaned = removeDuplicateTypes(noEmpty);

    return extractUnionValues(cleaned);
}
