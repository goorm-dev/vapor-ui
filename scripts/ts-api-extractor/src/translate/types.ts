export interface MqmError {
    category:
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
    severity: 'minor' | 'major' | 'critical';
    source_span: string;
    mt_span: string;
    explanation: string;
}

export interface MqmResult {
    verdict: 'PASS' | 'FAIL';
    errors: MqmError[];
}

export interface TranslationConfig {
    enabled: boolean;
    targetLocale: 'ko';
    llm: {
        enabled: boolean;
    };
    validation: {
        mqm: {
            enabled: boolean;
            failOnError: boolean;
        };
    };
}
