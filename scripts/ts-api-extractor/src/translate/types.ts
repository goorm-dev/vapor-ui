export type MqmCategory = 'accuracy' | 'fluency' | 'style';

export type MqmErrorType =
    | 'mistranslation'
    | 'omission/addition'
    | 'terminology'
    | 'untranslated'
    | 'grammar'
    | 'formatting'
    | 'unnaturalness'
    | 'formality';

export interface MqmError {
    category: MqmCategory;
    type: MqmErrorType;
    severity: 'minor' | 'major';
    source: string;
    translation: string;
    message: string;
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
