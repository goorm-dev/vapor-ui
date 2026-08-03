export interface TranslatableDocProp {
    name: string;
    description?: string;
}

export interface TranslatableDoc {
    name: string;
    displayName: string;
    description?: string;
    props: TranslatableDocProp[];
}

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

export type TranslationUnitKind = 'component.description' | 'prop.description';

export type TranslationUnit =
    | { kind: 'component.description'; componentDisplayName: string; source: string }
    | {
          kind: 'prop.description';
          componentDisplayName: string;
          propName: string;
          source: string;
      };

export function getUnitOwnerName(unit: TranslationUnit): string {
    return unit.kind === 'prop.description' ? unit.propName : unit.componentDisplayName;
}

export function makeUnitKey(componentDisplayName: string, propName: string | null): string {
    return `${componentDisplayName}:${propName ?? '(description)'}`;
}

export function getTranslationUnitKey(unit: TranslationUnit): string {
    return makeUnitKey(
        unit.componentDisplayName,
        unit.kind === 'prop.description' ? unit.propName : null,
    );
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
    translated: string;
    assurance: AssuranceStatus;
    reportable: boolean;
    reason: TranslationOutcomeReason;
    errors: MqmError[];
    violations: PreservationViolation[];
}

const REASON_META: Record<TranslationOutcomeReason, AssuranceStatus> = {
    cache_hit: 'verified',
    quality_gate_passed: 'verified',
    quality_gate_failed: 'unverified',
    translation_failed: 'unverified',
    preservation_fallback: 'unverified',
    batch_mqm_failed: 'unverified',
    batch_postprocess_failed: 'unverified',
    batch_final_mqm_failed: 'unverified',
};

export function makeOutcome(
    translated: string,
    reason: TranslationOutcomeReason,
    detail: { errors?: MqmError[]; violations?: PreservationViolation[] } = {},
): TranslationOutcome {
    const assurance = REASON_META[reason];
    return {
        translated,
        assurance,
        reportable: assurance === 'unverified',
        reason,
        errors: detail.errors ?? [],
        violations: detail.violations ?? [],
    };
}

export type PreservationRule = 'backtick_span' | 'identifier' | 'url' | 'markdown_structure';

export interface PreservationViolation {
    rule: PreservationRule;
    expected: string;
}
