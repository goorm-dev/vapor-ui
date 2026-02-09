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

    return splitTopLevelUnion(type)
        .map((part) => {
            if (!part.includes(STATE_MARKER)) return part;
            // ((state: ...) => string) 또는 (state: ...) => string 형태 처리
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
 * render prop 타입을 정리합니다.
 * - state 파라미터 제거: (props: HTMLProps, state: {}) => ReactElement → (props: HTMLProps) => ReactElement
 * - 중복 함수 타입 제거
 */
function cleanRenderPropType(type: string): string {
    // (props: HTMLProps, state: ...) 패턴에서 state 파라미터 제거
    let cleaned = type.replace(
        /\(props:\s*HTMLProps(?:<[^>]*>)?,\s*state:\s*[^)]*\)\s*=>\s*ReactElement/g,
        '(props: HTMLProps) => ReactElement',
    );

    // (props: HTMLProps<any>) => ReactElement → (props: HTMLProps) => ReactElement
    cleaned = cleaned.replace(
        /\(props:\s*HTMLProps<[^>]*>\)\s*=>\s*ReactElement/g,
        '(props: HTMLProps) => ReactElement',
    );

    return cleaned;
}

/**
 * top-level union만 분리합니다. 괄호/중괄호 안의 |는 무시합니다.
 * 예: "(a | b) | c" → ["(a | b)", "c"]
 */
function splitTopLevelUnion(type: string): string[] {
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
            // 제네릭 타입의 < 만 depth 증가 (=>의 >는 무시하기 위해)
            depth++;
            current += char;
        } else if (char === ')' || char === '}' || char === ']') {
            depth--;
            current += char;
        } else if (char === '>') {
            // =>의 >는 depth를 감소시키지 않음
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
