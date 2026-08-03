import { DEFAULT_POSTPROCESS_MODEL, DEFAULT_VALIDATION_MODEL } from '~/defaults';
import { callLlm } from '~/translation/client';
import { parseLlmJson } from '~/translation/json';
import {
    type MqmError,
    type MqmResult,
    type PreservationViolation,
    type TranslationOutcome,
    type TranslationUnit,
    getTranslationUnitKey,
} from '~/types';
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

interface BatchMqmSuccess {
    ok: true;
    evaluations: Map<string, MqmResult>;
}

interface BatchMqmInvalid {
    ok: false;
    reason: string;
}

type BatchMqmResult = BatchMqmSuccess | BatchMqmInvalid;

function invalidMqm(reason: string): BatchMqmInvalid {
    return { ok: false, reason };
}

function reconcileById<T extends { id: string }>(
    expectedIds: string[],
    items: T[],
): Map<string, T> {
    const expected = new Set(expectedIds);
    const result = new Map<string, T>();

    for (const item of items) {
        if (!expected.has(item.id)) throw new Error(`Unknown response id: ${item.id}`);
        if (result.has(item.id)) throw new Error(`Duplicate response id: ${item.id}`);
        result.set(item.id, item);
    }
    for (const id of expected) {
        if (!result.has(id)) throw new Error(`Missing response id: ${id}`);
    }
    return result;
}

interface BatchEvaluationItem {
    id: string;
    verdict: MqmResult['verdict'];
    errors: MqmError[];
}

function validateBatchEvaluations(units: TranslationUnit[], evaluations: unknown): BatchMqmResult {
    if (!Array.isArray(evaluations)) {
        return invalidMqm('MQM batch response must contain evaluations[]');
    }

    try {
        const items = reconcileById(
            units.map(getTranslationUnitKey),
            evaluations as BatchEvaluationItem[],
        );
        return {
            ok: true,
            evaluations: new Map(
                [...items].map(([id, item]) => [
                    id,
                    { verdict: item.verdict, errors: item.errors },
                ]),
            ),
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return invalidMqm(message);
    }
}

async function validateBatchWithMqm(
    units: TranslationUnit[],
    translations: Map<string, string>,
): Promise<BatchMqmResult> {
    if (units.length === 0) return { ok: true, evaluations: new Map() };

    const request = {
        units: units.map((unit) => ({
            id: getTranslationUnitKey(unit),
            kind: unit.kind,
            ownerName: unit.ownerName,
            source: unit.source,
            translated: translations.get(getTranslationUnitKey(unit)) ?? '',
        })),
    };

    const result = await callLlm(
        [
            { role: 'system', content: BATCH_MQM_SYSTEM_PROMPT },
            { role: 'user', content: JSON.stringify(request) },
        ],
        {
            model: DEFAULT_VALIDATION_MODEL,
            jsonSchema: { name: 'batch_mqm_response', schema: BATCH_MQM_RESPONSE_SCHEMA },
        },
    );

    if (!result.content) {
        const statusInfo = result.statusCode !== undefined ? ` (HTTP ${result.statusCode})` : '';
        return invalidMqm(`[batch-mqm] ${result.error ?? 'empty response'}${statusInfo}`);
    }

    try {
        const parsed = parseLlmJson(result.content);
        if (typeof parsed !== 'object' || parsed === null) {
            return invalidMqm('MQM batch response must be a JSON object');
        }
        return validateBatchEvaluations(units, (parsed as Record<string, unknown>).evaluations);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return invalidMqm(`Failed to parse MQM batch response: ${message}`);
    }
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

interface BatchPostprocessSuccess {
    ok: true;
    translations: Map<string, string>;
}

interface BatchPostprocessInvalid {
    ok: false;
    reason: string;
}

type BatchPostprocessResult = BatchPostprocessSuccess | BatchPostprocessInvalid;

function invalidPostprocess(reason: string): BatchPostprocessInvalid {
    return { ok: false, reason };
}

function validateBatchTranslations(
    inputs: BatchPostprocessInput[],
    translations: unknown,
): BatchPostprocessResult {
    if (!Array.isArray(translations)) {
        return invalidPostprocess('Postprocess batch response must contain translations[]');
    }

    try {
        const items = reconcileById(
            inputs.map((input) => getTranslationUnitKey(input.unit)),
            translations as { id: string; translated: string }[],
        );
        for (const item of items.values()) {
            if (item.translated.trim().length === 0) {
                return invalidPostprocess(`Empty translation for id: ${item.id}`);
            }
        }
        return {
            ok: true,
            translations: new Map([...items].map(([id, item]) => [id, item.translated])),
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return invalidPostprocess(message);
    }
}

async function postprocessBatchWithLlm(
    inputs: BatchPostprocessInput[],
): Promise<BatchPostprocessResult> {
    if (inputs.length === 0) return { ok: true, translations: new Map() };

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

    const result = await callLlm(
        [
            { role: 'system', content: BATCH_POSTPROCESS_SYSTEM_PROMPT },
            { role: 'user', content: JSON.stringify(request) },
        ],
        {
            model: DEFAULT_POSTPROCESS_MODEL,
            jsonSchema: {
                name: 'batch_postprocess_response',
                schema: BATCH_POSTPROCESS_RESPONSE_SCHEMA,
            },
        },
    );

    if (!result.content) {
        const statusInfo = result.statusCode !== undefined ? ` (HTTP ${result.statusCode})` : '';
        return invalidPostprocess(
            `[batch-postprocess] ${result.error ?? 'empty response'}${statusInfo}`,
        );
    }

    try {
        const parsed = parseLlmJson(result.content);
        if (typeof parsed !== 'object' || parsed === null) {
            return invalidPostprocess('Postprocess batch response must be a JSON object');
        }
        return validateBatchTranslations(inputs, (parsed as Record<string, unknown>).translations);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return invalidPostprocess(`Failed to parse postprocess batch response: ${message}`);
    }
}

// ─── Outcome Builders ─────────────────────────────────────────────────────────

function initialPassOutcome(unit: TranslationUnit, translated: string): TranslationOutcome {
    return {
        id: unit.id,
        translated,
        assurance: 'verified',
        reportable: false,
        reason: 'quality_gate_passed',
    };
}

function finalOutcome(
    unit: TranslationUnit,
    translated: string,
    finalEvaluation: MqmResult,
): TranslationOutcome {
    const passed = finalEvaluation.verdict === 'PASS';
    return {
        id: unit.id,
        translated,
        assurance: passed ? 'verified' : 'unverified',
        reportable: !passed,
        reason: passed ? 'quality_gate_passed' : 'quality_gate_failed',
        ...(passed ? {} : { errors: finalEvaluation.errors }),
    };
}

/**
 * 문자열 보존을 끝까지 못 지킨 유닛은 한국어를 버리고 영어 원문을 그대로 쓴다 (KAN-10).
 * 잘못된 식별자·코드가 들어간 한국어보다 영어가 낫다.
 */
export function preservationFallbackOutcome(
    unit: TranslationUnit,
    violations: PreservationViolation[],
): TranslationOutcome {
    return {
        id: unit.id,
        translated: unit.source,
        assurance: 'unverified',
        reportable: true,
        reason: 'preservation_fallback',
        violations,
    };
}

function degradedOutcome(
    unit: TranslationUnit,
    translated: string,
    reason: 'batch_mqm_failed' | 'batch_postprocess_failed' | 'batch_final_mqm_failed',
    errors: MqmError[] = [],
): TranslationOutcome {
    return {
        id: unit.id,
        translated,
        assurance: 'unverified',
        reportable: true,
        reason,
        ...(errors.length > 0 ? { errors } : {}),
    };
}

// ─── Chunk Helper ─────────────────────────────────────────────────────────────

function chunkArray<T>(items: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let index = 0; index < items.length; index += size) {
        chunks.push(items.slice(index, index + size));
    }
    return chunks;
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
                    : degradedOutcome(
                          unit,
                          requireTranslation(translations, unit),
                          'batch_mqm_failed',
                      ),
            ]);
        }
        return { outcomes, batchFailureReasons };
    }

    const failedUnits: FailedUnit[] = [];
    for (const unit of units) {
        const key = getTranslationUnitKey(unit);
        const translated = requireTranslation(translations, unit);
        const evaluation = initialResult.evaluations.get(key);
        if (evaluation === undefined) {
            throw new Error(`Missing batch MQM result for id: ${key}`);
        }
        const violations = violationsOf(unit);
        if (evaluation.verdict === 'PASS' && violations.length === 0) {
            outcomes.push([unit, initialPassOutcome(unit, translated)]);
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
                        : degradedOutcome(
                              failed.unit,
                              failed.initialTranslation,
                              'batch_postprocess_failed',
                              failed.errors,
                          ),
                ]);
            }
            continue;
        }

        // 후편집 결과를 결정론 체크로 먼저 걸러낸다 — 실패하면 MQM 판정과 무관하게 영어 폴백.
        const recheckable: FailedUnit[] = [];
        for (const failed of failedChunk) {
            const key = getTranslationUnitKey(failed.unit);
            const postprocessed = postprocess.translations.get(key) ?? failed.initialTranslation;
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
            postprocess.translations,
        );

        if (!finalResult.ok) {
            batchFailureReasons.push(`final batch MQM invalid: ${finalResult.reason}`);
            for (const failed of recheckable) {
                const key = getTranslationUnitKey(failed.unit);
                const postprocessed =
                    postprocess.translations.get(key) ?? failed.initialTranslation;
                outcomes.push([
                    failed.unit,
                    degradedOutcome(failed.unit, postprocessed, 'batch_final_mqm_failed'),
                ]);
            }
            continue;
        }

        for (const failed of recheckable) {
            const key = getTranslationUnitKey(failed.unit);
            const translated = postprocess.translations.get(key);
            const finalEvaluation = finalResult.evaluations.get(key);
            if (translated === undefined || finalEvaluation === undefined) {
                throw new Error(`Missing final batch MQM result for id: ${key}`);
            }
            outcomes.push([failed.unit, finalOutcome(failed.unit, translated, finalEvaluation)]);
        }
    }

    return { outcomes, batchFailureReasons };
}
