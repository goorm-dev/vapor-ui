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
    /** LLM 호출 실패 또는 응답 파싱 실패로 인해 검증 없이 PASS 처리된 경우 */
    degraded?: true;
}

export interface TranslationConfig {
    enabled: boolean;
    skipCache: boolean;
    targetLocale: 'ko';
    llm: {
        enabled: boolean;
        postprocessModel?: string;
        validationModel?: string;
    };
    validation: {
        mqm: {
            enabled: boolean;
            failOnError: boolean;
        };
    };
}
