import { type BatchResult, callBatch } from '~/batch-call';
import { DEFAULT_POSTPROCESS_MODEL, DEFAULT_VALIDATION_MODEL } from '~/defaults';
import {
    type MqmError,
    type MqmResult,
    type PreservationViolation,
    type TranslationOutcome,
    type TranslationUnit,
    getTranslationUnitKey,
    makeOutcome,
} from '~/types';
import { chunkArray } from '~/util';
import { checkPreservation, describeViolation } from '~/validation/preserve';
import {
    MQM_CATEGORY_VALUES,
    MQM_EVALUATOR_PROMPT,
    MQM_SEVERITY_VALUES,
} from '~/validation/validator';

const POSTPROCESS_BATCH_SIZE = 10;

// ─── Batch MQM ───────────────────────────────────────────────────────────────

const BATCH_MQM_SYSTEM_PROMPT = `${MQM_EVALUATOR_PROMPT}

Batch mode:
You will receive multiple translation units, possibly from different components.
Evaluate each unit independently and echo its id back exactly as given.
Respond with EXACTLY this JSON shape and nothing else:
{"evaluations":[{"id":"12:component.description","verdict":"PASS","errors":[]}]}`;

const MQM_ERROR_SCHEMA = {
    type: 'object',
    additionalProperties: false,
    required: ['category', 'severity', 'source_span', 'mt_span', 'explanation'],
    properties: {
        category: { type: 'string', enum: MQM_CATEGORY_VALUES },
        severity: { type: 'string', enum: MQM_SEVERITY_VALUES },
        source_span: { type: 'string' },
        mt_span: { type: 'string' },
        explanation: { type: 'string' },
    },
};

const BATCH_MQM_RESPONSE_SCHEMA = {
    type: 'object',
    additionalProperties: false,
    required: ['evaluations'],
    properties: {
        evaluations: {
            type: 'array',
            items: {
                type: 'object',
                additionalProperties: false,
                required: ['id', 'verdict', 'errors'],
                properties: {
                    id: { type: 'string' },
                    verdict: { type: 'string', enum: ['PASS', 'FAIL'] },
                    errors: { type: 'array', items: MQM_ERROR_SCHEMA },
                },
            },
        },
    },
};

interface BatchEvaluationItem {
    id: string;
    verdict: MqmResult['verdict'];
    errors: MqmError[];
}

async function validateBatchWithMqm(
    units: TranslationUnit[],
    translations: Map<string, string>,
): Promise<BatchResult<Map<string, MqmResult>>> {
    if (units.length === 0) return { ok: true, value: new Map() };

    const request = {
        units: units.map((unit) => ({
            id: getTranslationUnitKey(unit),
            kind: unit.kind,
            ownerName: unit.ownerName,
            source: unit.source,
            translated: translations.get(getTranslationUnitKey(unit)) ?? '',
        })),
    };

    const result = await callBatch<BatchEvaluationItem>(
        'batch-mqm',
        BATCH_MQM_SYSTEM_PROMPT,
        DEFAULT_VALIDATION_MODEL,
        { name: 'batch_mqm_response', schema: BATCH_MQM_RESPONSE_SCHEMA },
        request,
        units.map(getTranslationUnitKey),
        'evaluations',
    );
    if (!result.ok) return result;

    return {
        ok: true,
        value: new Map(
            [...result.value].map(([id, item]) => [
                id,
                { verdict: item.verdict, errors: item.errors },
            ]),
        ),
    };
}

// ─── Batch Postprocess ───────────────────────────────────────────────────────

const BATCH_POSTPROCESS_SYSTEM_PROMPT = `You are a professional Korean translator and post-editor for a design system documentation site.

You will receive failed translation units with their English source text, initial Korean translation, MQM error feedback, and string-preservation violations detected by a deterministic checker.

Rules:
1. Fix every MQM error and every preservation violation listed for each unit.
2. A preservation violation means a string that must appear verbatim in the Korean text is missing or altered. Restore it exactly as it appears in the source.
3. Do not change parts that are not covered by any error unless required for grammar.
4. Never translate or alter PascalCase component names, camelCase prop names, quoted enum values, inline code, token names, URLs, or markdown formatting.
5. Respond ONLY with JSON in this exact shape, echoing each id exactly as given:
{"translations":[{"id":"12:component.description","translated":"final Korean text"}]}`;

const BATCH_POSTPROCESS_RESPONSE_SCHEMA = {
    type: 'object',
    additionalProperties: false,
    required: ['translations'],
    properties: {
        translations: {
            type: 'array',
            items: {
                type: 'object',
                additionalProperties: false,
                required: ['id', 'translated'],
                properties: {
                    id: { type: 'string' },
                    translated: { type: 'string' },
                },
            },
        },
    },
};

interface BatchPostprocessInput {
    unit: TranslationUnit;
    initialTranslation: string;
    errors: MqmError[];
    violations: PreservationViolation[];
}

async function postprocessBatchWithLlm(
    inputs: BatchPostprocessInput[],
): Promise<BatchResult<Map<string, string>>> {
    if (inputs.length === 0) return { ok: true, value: new Map() };

    const request = {
        units: inputs.map(({ unit, initialTranslation, errors, violations }) => ({
            id: getTranslationUnitKey(unit),
            kind: unit.kind,
            ownerName: unit.ownerName,
            componentName: unit.componentName,
            source: unit.source,
            initialTranslation,
            errors,
            preservationViolations: violations.map(describeViolation),
        })),
    };

    const result = await callBatch<{ id: string; translated: string }>(
        'batch-postprocess',
        BATCH_POSTPROCESS_SYSTEM_PROMPT,
        DEFAULT_POSTPROCESS_MODEL,
        { name: 'batch_postprocess_response', schema: BATCH_POSTPROCESS_RESPONSE_SCHEMA },
        request,
        inputs.map((input) => getTranslationUnitKey(input.unit)),
        'translations',
    );
    if (!result.ok) return result;

    for (const item of result.value.values()) {
        if (item.translated.trim().length === 0) {
            return { ok: false, reason: `Empty translation for id: ${item.id}` };
        }
    }
    return {
        ok: true,
        value: new Map([...result.value].map(([id, item]) => [id, item.translated])),
    };
}

// ─── Outcome Builders ─────────────────────────────────────────────────────────

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

// ─── Batch Lifecycle ──────────────────────────────────────────────────────────

interface FailedUnit {
    unit: TranslationUnit;
    initialTranslation: string;
    errors: MqmError[];
    violations: PreservationViolation[];
}

export interface BatchLifecycleResult {
    outcomes: [TranslationUnit, TranslationOutcome][];
    batchFailureReasons: string[];
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
