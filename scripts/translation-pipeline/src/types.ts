/**
 * 번역 파이프라인이 입력으로 받는 문서 형태.
 * `ts-api-extractor`의 출력 스키마와는 의도적으로 분리한다 — 번역에 필요한 필드만 노출한다.
 */
export interface TranslatableDocProp {
    name: string;
    description?: string;
}

export interface TranslatableDoc {
    name: string;
    description?: string;
    props: TranslatableDocProp[];
}

/**
 * LLM 판정이 실제로 신뢰 가능한 축만 남긴 6종 (KAN-10).
 * 문자열 보존(코드 스팬·식별자·URL·마크다운 구조)은 LLM이 아니라
 * `validation/preserve.ts`의 결정론 체크가 담당한다.
 */
export type MqmCategory =
    | 'Accuracy/Mistranslation'
    | 'Accuracy/Omission'
    | 'Accuracy/Addition'
    | 'Fluency/Unnatural phrasing'
    | 'Fluency/Style inconsistency'
    | 'Fluency/Grammatical error';

export interface MqmError {
    category: MqmCategory;
    severity: 'minor' | 'major' | 'critical';
    source_span: string;
    mt_span: string;
    explanation: string;
}

export interface MqmResult {
    verdict: 'PASS' | 'FAIL';
    errors: MqmError[];
    /** LLM 호출 실패 또는 응답 파싱 실패로 인해 품질 게이트 결과를 신뢰할 수 없는 경우 */
    unavailable?: true;
}

export type TranslationUnitKind = 'component.description' | 'prop.description';

export interface TranslationUnit {
    id: string;
    kind: TranslationUnitKind;
    ownerName: string;
    source: string;
    componentIndex: number;
    componentName: string;
    propIndex?: number;
}

/**
 * 배치 식별자. `id`는 컴포넌트 안에서만 유일하므로(`props[0].size.description`),
 * 컴포넌트를 섞는 횡단 배치에서는 반드시 이 키를 써야 응답 매핑이 어긋나지 않는다.
 */
export function getTranslationUnitKey(unit: TranslationUnit): string {
    return `${unit.componentIndex}:${unit.id}`;
}

export type AssuranceStatus = 'verified' | 'unverified';

export type TranslationOutcomeReason =
    | 'cache_hit'
    | 'quality_gate_passed'
    | 'quality_gate_failed'
    | 'translation_failed'
    | 'preservation_fallback'
    | 'batch_mqm_failed'
    | 'batch_postprocess_failed'
    | 'batch_final_mqm_failed';

export interface TranslationOutcome {
    id: string;
    translated: string;
    assurance: AssuranceStatus;
    reportable: boolean;
    reason: TranslationOutcomeReason;
    errors?: MqmError[];
    violations?: PreservationViolation[];
}

/** 결정론 문자열 보존 체크의 규칙 4종 (KAN-10) */
export type PreservationRule = 'backtick_span' | 'identifier' | 'url' | 'markdown_structure';

export interface PreservationViolation {
    rule: PreservationRule;
    /** 번역문에 그대로 남아 있어야 했던 문자열(마크다운 구조는 시그니처) */
    expected: string;
}
