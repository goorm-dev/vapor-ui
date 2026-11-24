import { isUnitless } from '~/tokens/css-reference';

export interface NormalizeInput {
    property: string; // camelCase or kebab — isUnitless 가 양쪽 지원.
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
 * - 문자열 → raw CSS 값으로 통과. `$token` 은 여기서 다루지 않는다 — 토큰 판정·치환은
 *   `models/token-ref` 문법 하나로 parse-call(컴파일)과 `_resolveToken`(런타임)이 한다.
 *
 * unitless 판단은 `tokens/css-reference.ts` 의 공통 레퍼런스에 위임해
 * compile/runtime 양쪽이 같은 규약을 공유하도록 한다.
 */
export function normalizeValue({ property, rawValue }: NormalizeInput): NormalizeOutput {
    if (typeof rawValue === 'number') {
        if (isUnitless(property)) return { css: String(rawValue) };
        return { css: `${rawValue}px` };
    }

    return { css: rawValue };
}
