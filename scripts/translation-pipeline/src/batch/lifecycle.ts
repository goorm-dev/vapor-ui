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

function finalOutcome(
    unit: TranslationUnit,
    translated: string,
    finalEvaluation: MqmResult,
): TranslationOutcome {
    return finalEvaluation.verdict === 'PASS'
        ? makeOutcome(unit, translated, 'quality_gate_passed')
        : makeOutcome(unit, translated, 'quality_gate_failed', {
              errors: finalEvaluation.errors,
          });
}

/**
 * 문자열 보존을 끝까지 못 지킨 유닛은 한국어를 버리고 영어 원문을 그대로 쓴다 (KAN-10).
 * 잘못된 식별자·코드가 들어간 한국어보다 영어가 낫다.
 */
function preservationFallbackOutcome(
    unit: TranslationUnit,
    violations: PreservationViolation[],
): TranslationOutcome {
    return makeOutcome(unit, unit.source, 'preservation_fallback', { violations });
}

function requireTranslation(translations: Map<string, string>, unit: TranslationUnit): string {
    const translated = translations.get(getTranslationUnitKey(unit));
    if (translated === undefined) {
        throw new Error(`Missing translation for unit id: ${getTranslationUnitKey(unit)}`);
    }
    return translated;
}

/**
 * 한 MQM 배치의 수명주기: 결정론 보존 체크 + MQM → 후편집 → 재검사.
 * 배치는 컴포넌트를 섞은 횡단 배치다 (KAN-11).
 */
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
                    : makeOutcome(unit, requireTranslation(translations, unit), 'batch_mqm_failed'),
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
            outcomes.push([unit, makeOutcome(unit, translated, 'quality_gate_passed')]);
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
                        : makeOutcome(
                              failed.unit,
                              failed.initialTranslation,
                              'batch_postprocess_failed',
                              { errors: failed.errors },
                          ),
                ]);
            }
            continue;
        }

        // 후편집 결과를 결정론 체크로 먼저 걸러낸다 — 실패하면 MQM 판정과 무관하게 영어 폴백.
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
                outcomes.push([
                    failed.unit,
                    makeOutcome(failed.unit, postprocessed, 'batch_final_mqm_failed'),
                ]);
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
            outcomes.push([failed.unit, finalOutcome(failed.unit, translated, finalEvaluation)]);
        }
    }

    return { outcomes, batchFailureReasons };
}
