/**
 * 타입 정리 모듈
 *
 * Component.State를 포함한 콜백 타입을 단순화합니다.
 * 예: "string | ((state: X.State) => string)" → "string"
 *
 * 10개 이상의 string literal union은 압축합니다.
 * 예: '"a" | "b" | ... (15개)' → 'string (15 variants)'
 */

const STATE_MARKER = '.State)';
const GENERIC_STATE_PATTERN = /,\s*[^,<>]*\.State(?:>|\))/g;
const UNION_COMPRESSION_THRESHOLD = 10;

export interface TypeCleanResult {
    type: string;
    values?: string[];
}

export function containsStateCallback(type: string): boolean {
    return type.includes(STATE_MARKER);
}

export function simplifyStateCallback(type: string): string {
    if (!containsStateCallback(type)) return type;

    return type
        .split('|')
        .map((part) => part.trim())
        .map((part) => {
            if (!part.includes(STATE_MARKER)) return part;
            // ((state: ...) => string) 또는 (state: ...) => string 형태 처리
            const match = part.match(/=>\s*(\w+)\)?$/);
            return match ? match[1] : part;
        })
        .join(' | ');
}

function removeEmptyUnion(type: string): string {
    return type
        .split('|')
        .map((part) => part.trim())
        .filter(Boolean)
        .join(' | ');
}

function removeDuplicateTypes(type: string): string {
    const parts = type.split('|').map((part) => part.trim());
    const unique = [...new Set(parts)];
    return unique.join(' | ');
}

function removeGenericState(type: string): string {
    return type.replace(GENERIC_STATE_PATTERN, (match) => {
        return match.endsWith('>') ? '>' : ')';
    });
}

function simplifyRenderType(type: string): string {
    if (!type.includes('ComponentRenderFn')) return type;

    const hasUndefined = type.includes('undefined');
    return hasUndefined
        ? 'ReactElement | ((props: HTMLProps) => ReactElement) | undefined'
        : 'ReactElement | ((props: HTMLProps) => ReactElement)';
}

function isStringLiteral(part: string): boolean {
    const trimmed = part.trim();
    return trimmed.startsWith('"') && trimmed.endsWith('"');
}

function extractStringValue(literal: string): string {
    return literal.trim().slice(1, -1);
}

function compressLargeUnion(type: string): TypeCleanResult {
    const parts = type.split(' | ');
    const nonUndefined = parts.filter((p) => p.trim() !== 'undefined');
    const hasUndefined = parts.some((p) => p.trim() === 'undefined');

    const stringLiterals = nonUndefined.filter(isStringLiteral);
    const shouldCompress =
        stringLiterals.length >= UNION_COMPRESSION_THRESHOLD &&
        stringLiterals.length === nonUndefined.length;

    if (!shouldCompress) {
        return { type };
    }

    const values = stringLiterals.map(extractStringValue);
    const compressedType = hasUndefined
        ? `string (${stringLiterals.length} variants) | undefined`
        : `string (${stringLiterals.length} variants)`;

    return { type: compressedType, values };
}

export function cleanType(type: string): TypeCleanResult {
    const renderSimplified = simplifyRenderType(type);
    if (renderSimplified !== type) {
        return { type: renderSimplified };
    }

    const noGenericState = removeGenericState(type);
    const simplified = simplifyStateCallback(noGenericState);
    const noEmpty = removeEmptyUnion(simplified);
    const cleaned = removeDuplicateTypes(noEmpty);

    return compressLargeUnion(cleaned);
}
