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
        | 'mutated-constant';
    message: string;
    loc: { line: number; column: number };
    hint?: string;
    frame?: string;
}

/**
 * IR — parse-call 이 방출, emit-css 가 소비.
 * selectorContext 는 style-macro 방식 canonical 문자열:
 *   'base' | ':hover' | '::before' | '@media(min-width:768px):hover' | ...
 */
export interface StaticRule {
    kind: 'static';
    property: string; // kebab-case
    value: string; // 최종 CSS 값 (`var(--vapor-...)` 또는 literal)
    rawValue?: string; // 소스 그대로 형태 (`$token`, `#hex`, `12`). dev slug 용
    selectorContext: string;
}

export interface DynamicRule {
    kind: 'dynamic';
    property: string;
    slotId: string;
    selectorContext: string;
    sourceExpr: string;
    /** `sourceExpr` 의 원본 소스 위치. 캡처가 식을 정의 위치에서 이름으로 옮길 때 쓴다. */
    start: number;
    end: number;
}

export type IRRule = StaticRule | DynamicRule;

/**
 * class-name 계산용 튜플. IR 에서 파생.
 * P2 단계 하위 호환을 위해 condition 방식과 selectorContext 방식 둘 다 지원.
 */
export interface Tuple {
    property: string;
    value: string;
    rawValue?: string;
    selectorContext: string;
}
