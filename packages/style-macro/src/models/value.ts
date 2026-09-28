import { propertyToTokenAxis, tokens } from '~/tokens';

const UNITLESS = new Set([
    'opacity',
    'z-index',
    'zIndex',
    'line-height',
    'lineHeight',
    'font-weight',
    'fontWeight',
    'flex',
    'flex-grow',
    'flexGrow',
    'flex-shrink',
    'flexShrink',
    'order',
    'columns',
    'column-count',
    'columnCount',
    'zoom',
    '-webkit-line-clamp',
    'WebkitLineClamp',
]);

export interface NormalizeInput {
    property: string; // camelCase
    rawValue: string | number;
}

export interface NormalizeOutput {
    css: string;
    // 향후 warning 코드 확장 용 (현재 미사용).
    warning?: string;
}

/**
 * source-form 값을 최종 CSS 값으로 정규화.
 * - number → unitless props 는 그대로, 그 외 `px` 추가
 * - `$token` → 하드코딩 tokens 조회 후 `var(...)` 문자열
 * - 그 외 문자열 → raw CSS 값으로 통과
 */
export function normalizeValue({ property, rawValue }: NormalizeInput): NormalizeOutput {
    const axis = (propertyToTokenAxis as Record<string, string>)[property];

    if (typeof rawValue === 'number') {
        if (UNITLESS.has(property)) return { css: String(rawValue) };
        return { css: `${rawValue}px` };
    }

    if (rawValue.startsWith('$')) {
        const tokenKey = rawValue.slice(1);
        if (axis) {
            const axisTable = (tokens as Record<string, Record<string, string>>)[axis];
            if (axisTable && tokenKey in axisTable) return { css: axisTable[tokenKey] };
        }
        // token 아닌 값은 raw 로 통과 시키되 caller 가 error 로 잡음.
        return { css: tokenKey };
    }

    return { css: rawValue };
}
