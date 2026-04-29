export interface MqmError {
    category:
        | 'Accuracy/Mistranslation'
        | 'Accuracy/Omission'
        | 'Accuracy/Addition'
        | 'Fluency/Grammar'
        | 'Terminology'
        | 'Style'
        | 'Locale convention';
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
