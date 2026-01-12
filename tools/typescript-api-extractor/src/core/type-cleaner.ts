/**
 * State 타입 정리 모듈
 *
 * Component.State를 포함한 콜백 타입을 단순화합니다.
 * 예: "string | ((state: X.State) => string)" → "string"
 */

const STATE_MARKER = '.State)';
const GENERIC_STATE_PATTERN = /,\s*[^,<>]*\.State(?:>|\))/g;

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

export function cleanType(type: string): string {
    const renderSimplified = simplifyRenderType(type);
    if (renderSimplified !== type) return renderSimplified;

    const noGenericState = removeGenericState(type);
    const simplified = simplifyStateCallback(noGenericState);
    const noEmpty = removeEmptyUnion(simplified);
    return removeDuplicateTypes(noEmpty);
}
