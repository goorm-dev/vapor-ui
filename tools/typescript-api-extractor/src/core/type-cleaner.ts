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

function simplifyRenderType(type: string): TypeCleanResult | null {
    if (!type.includes('ComponentRenderFn')) return null;
    return {
        type: 'ReactElement | ((props: HTMLProps) => ReactElement) | undefined',
        values: ['ReactElement', '(props: HTMLProps) => ReactElement', 'undefined'],
    };
}

function isStringLiteral(part: string): boolean {
    const trimmed = part.trim();
    return trimmed.startsWith('"') && trimmed.endsWith('"');
}

function extractStringValue(literal: string): string {
    return literal.trim().slice(1, -1);
}

function extractUnionValues(type: string): TypeCleanResult {
    const parts = type.split(' | ').map((p) => p.trim());
    const nonUndefined = parts.filter((p) => p !== 'undefined');

    const stringLiterals = nonUndefined.filter(isStringLiteral);

    if (stringLiterals.length === nonUndefined.length && stringLiterals.length > 0) {
        return { type, values: stringLiterals.map(extractStringValue) };
    }

    return { type };
}

export function cleanType(type: string): TypeCleanResult {
    const renderResult = simplifyRenderType(type);
    if (renderResult) {
        return renderResult;
    }

    const noGenericState = removeGenericState(type);
    const simplified = simplifyStateCallback(noGenericState);
    const noEmpty = removeEmptyUnion(simplified);
    const cleaned = removeDuplicateTypes(noEmpty);

    return extractUnionValues(cleaned);
}
