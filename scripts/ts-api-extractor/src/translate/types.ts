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

export type MqmStageResult = MqmResult;

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
    | 'quality_gate_disabled'
    | 'initial_quality_gate_passed'
    | 'initial_quality_gate_failed'
    | 'initial_quality_gate_unavailable'
    | 'postprocess_response_invalid'
    | 'final_quality_gate_passed'
    | 'final_quality_gate_failed'
    | 'final_quality_gate_unavailable';

export interface TranslationEvent {
    stage: 'cache' | 'translation' | 'mqm' | 'postprocess';
    message: string;
}

export interface TranslationOutcome {
    id: string;
    source: string;
    translated: string;
    assurance: AssuranceStatus;
    reportable: boolean;
    reason: TranslationOutcomeReason;
    initialTranslation?: string;
    initialEvaluation?: MqmStageResult;
    finalEvaluation?: MqmStageResult;
    events: TranslationEvent[];
}

export interface TranslationConfig {
    enabled: boolean;
    skipCache: boolean;
    targetLocale: 'ko';
    llm: {
        translationModel?: string;
        postprocessModel?: string;
        validationModel?: string;
    };
    validation: {
        mqm: {
            enabled: boolean;
        };
    };
}
