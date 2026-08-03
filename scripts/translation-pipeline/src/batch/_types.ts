import type {
    MqmError,
    PreservationViolation,
    TranslationOutcome,
    TranslationUnit,
} from '~/domain';

export interface MqmResult {
    verdict: 'PASS' | 'FAIL';
    errors: MqmError[];
}

export interface FailedUnit {
    unit: TranslationUnit;
    initialTranslation: string;
    errors: MqmError[];
    violations: PreservationViolation[];
}

export interface BatchLifecycleResult {
    outcomes: [TranslationUnit, TranslationOutcome][];
    batchFailureReasons: string[];
}
