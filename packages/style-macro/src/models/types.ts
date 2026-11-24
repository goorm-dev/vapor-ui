import type { RuleContext } from './selector';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyProp = any;

export interface BuildError {
    code:
        | 'unknown-token'
        | 'scope-mismatch'
        | 'unknown-property'
        | 'invalid-input-shape'
        | 'invalid-selector'
        | 'dynamic-value'
        | 'computed-key'
        | 'spread'
        | 'parse-error'
        | 'mutated-constant'
        | 'invalid-value';
    message: string;
    loc: { line: number; column: number };
    hint?: string;
    frame?: string;
}

/**
 * IR — parse-call 이 방출, emit-css 가 소비.
 * context 는 중첩 단계마다 풀린 at-rule 스택 + selector 목록 (`~/models/selector`).
 */
export interface StaticRule {
    kind: 'static';
    property: string; // kebab-case
    value: string; // 최종 CSS 값 (`var(--vapor-...)` 또는 literal)
    rawValue?: string; // 소스 그대로 형태 (`$token`, `#hex`, `12`). dev slug 용
    context: RuleContext;
}

export interface DynamicRule {
    kind: 'dynamic';
    property: string;
    slotId: string;
    context: RuleContext;
    sourceExpr: string;
    /** `sourceExpr` 의 원본 소스 위치. 캡처가 식을 정의 위치에서 이름으로 옮길 때 쓴다. */
    start: number;
    end: number;
}

export type IRRule = StaticRule | DynamicRule;
