import type { BatchLifecycleResult, FailedUnit, MqmResult } from '~/batch/_types';
import { validateBatchWithMqm } from '~/batch/mqm';
import { postprocessBatchWithLlm } from '~/batch/postprocess';
import {
    type PreservationViolation,
    type TranslationOutcome,
    type TranslationUnit,
    getTranslationUnitKey,
    makeOutcome,
} from '~/domain';
import { checkPreservation } from '~/preserve';
import { chunkArray } from '~/util';

const POSTPROCESS_BATCH_SIZE = 10;

function finalOutcome(translated: string, finalEvaluation: MqmResult): TranslationOutcome {
    return finalEvaluation.verdict === 'PASS'
        ? makeOutcome(translated, 'quality_gate_passed')
        : makeOutcome(translated, 'quality_gate_failed', {
              errors: finalEvaluation.errors,
          });
}

function preservationFallbackOutcome(
    unit: TranslationUnit,
    violations: PreservationViolation[],
): TranslationOutcome {
    return makeOutcome(unit.source, 'preservation_fallback', { violations });
}

function requireTranslation(translations: Map<string, string>, unit: TranslationUnit): string {
    const translated = translations.get(getTranslationUnitKey(unit));
    if (translated === undefined) {
        throw new Error(`Missing translation for unit id: ${getTranslationUnitKey(unit)}`);
    }
    return translated;
}

export async function processBatchLifecycle(
    units: TranslationUnit[],
    translations: Map<string, string>,
): Promise<BatchLifecycleResult> {
    const outcomes: [TranslationUnit, TranslationOutcome][] = [];
    const batchFailureReasons: string[] = [];

    const violationsByKey = new Map<string, PreservationViolation[]>(
        units.map((unit) => [
            getTranslationUnitKey(unit),
            checkPreservation(unit.source, requireTranslation(translations, unit)),
        ]),
    );
    const violationsOf = (unit: TranslationUnit): PreservationViolation[] =>
        violationsByKey.get(getTranslationUnitKey(unit)) ?? [];

    const initialResult = await validateBatchWithMqm(units, translations);

    if (!initialResult.ok) {
        batchFailureReasons.push(`initial batch MQM invalid: ${initialResult.reason}`);
        for (const unit of units) {
            const violations = violationsOf(unit);
            outcomes.push([
                unit,
                violations.length > 0
                    ? preservationFallbackOutcome(unit, violations)
                    : makeOutcome(requireTranslation(translations, unit), 'batch_mqm_failed'),
            ]);
        }
        return { outcomes, batchFailureReasons };
    }

    const failedUnits: FailedUnit[] = [];
    for (const unit of units) {
        const key = getTranslationUnitKey(unit);
        const translated = requireTranslation(translations, unit);
        const evaluation = initialResult.value.get(key);
        if (evaluation === undefined) {
            throw new Error(`Missing batch MQM result for id: ${key}`);
        }
        const violations = violationsOf(unit);
        if (evaluation.verdict === 'PASS' && violations.length === 0) {
            outcomes.push([unit, makeOutcome(translated, 'quality_gate_passed')]);
            continue;
        }
        failedUnits.push({
            unit,
            initialTranslation: translated,
            errors: evaluation.errors,
            violations,
        });
    }

    for (const failedChunk of chunkArray(failedUnits, POSTPROCESS_BATCH_SIZE)) {
        const postprocess = await postprocessBatchWithLlm(failedChunk);

        if (!postprocess.ok) {
            batchFailureReasons.push(`batch postprocess invalid: ${postprocess.reason}`);
            for (const failed of failedChunk) {
                outcomes.push([
                    failed.unit,
                    failed.violations.length > 0
                        ? preservationFallbackOutcome(failed.unit, failed.violations)
                        : makeOutcome(failed.initialTranslation, 'batch_postprocess_failed', {
                              errors: failed.errors,
                          }),
                ]);
            }
            continue;
        }

        const recheckable: FailedUnit[] = [];
        for (const failed of failedChunk) {
            const key = getTranslationUnitKey(failed.unit);
            const postprocessed = postprocess.value.get(key) ?? failed.initialTranslation;
            const violations = checkPreservation(failed.unit.source, postprocessed);
            if (violations.length > 0) {
                outcomes.push([failed.unit, preservationFallbackOutcome(failed.unit, violations)]);
                continue;
            }
            recheckable.push(failed);
        }

        if (recheckable.length === 0) continue;

        const finalResult = await validateBatchWithMqm(
            recheckable.map(({ unit }) => unit),
            postprocess.value,
        );

        if (!finalResult.ok) {
            batchFailureReasons.push(`final batch MQM invalid: ${finalResult.reason}`);
            for (const failed of recheckable) {
                const key = getTranslationUnitKey(failed.unit);
                const postprocessed = postprocess.value.get(key) ?? failed.initialTranslation;
                outcomes.push([failed.unit, makeOutcome(postprocessed, 'batch_final_mqm_failed')]);
            }
            continue;
        }

        for (const failed of recheckable) {
            const key = getTranslationUnitKey(failed.unit);
            const translated = postprocess.value.get(key);
            const finalEvaluation = finalResult.value.get(key);
            if (translated === undefined || finalEvaluation === undefined) {
                throw new Error(`Missing final batch MQM result for id: ${key}`);
            }
            outcomes.push([failed.unit, finalOutcome(translated, finalEvaluation)]);
        }
    }

    return { outcomes, batchFailureReasons };
}
