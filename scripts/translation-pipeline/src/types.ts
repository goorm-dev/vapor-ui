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

export type MqmCategory =
    | 'Terminology/Component name inconsistency'
    | 'Terminology/Token name altered'
    | 'Terminology/Prop name mistranslated'
    | 'Accuracy/Mistranslation'
    | 'Accuracy/Omission'
    | 'Accuracy/Addition'
    | 'Fluency/Unnatural phrasing'
    | 'Fluency/Style inconsistency'
    | 'Fluency/Grammatical error'
    | 'Markup & Code/Code block translated'
    | 'Markup & Code/Link / anchor broken'
    | 'Markup & Code/Markdown structure altered'
    | 'Cross-reference/Inter-page inconsistency'
    | 'Cross-reference/See also mismatch'
    | 'Locale/Number / unit format'
    | 'Locale/Directional text';

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
    propIndex?: number;
}

export type AssuranceStatus = 'verified' | 'unverified';

export type TranslationOutcomeReason =
    | 'cache_hit'
    | 'quality_gate_passed'
    | 'quality_gate_failed'
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
}
