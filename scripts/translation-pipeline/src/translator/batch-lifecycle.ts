import { DEFAULT_POSTPROCESS_MODEL, DEFAULT_VALIDATION_MODEL } from '~/defaults';
import { callLlm } from '~/translation/client';
import { parseLlmJson } from '~/translation/json';
import type { MqmError, MqmResult, TranslationOutcome, TranslationUnit } from '~/types';
import {
    MQM_CATEGORY_VALUES,
    MQM_EVALUATOR_PROMPT,
    MQM_SEVERITY_VALUES,
} from '~/validation/validator';

const MQM_BATCH_SIZE = 10;
const POSTPROCESS_BATCH_SIZE = 10;

// ─── Batch MQM ───────────────────────────────────────────────────────────────

const BATCH_MQM_SYSTEM_PROMPT = `${MQM_EVALUATOR_PROMPT}

Batch mode:
You will receive multiple translation units. Evaluate each unit independently.
Respond with EXACTLY this JSON shape and nothing else:
{"evaluations":[{"id":"component.description","verdict":"PASS","errors":[]}]}`;

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
            units.map((unit) => unit.id),
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
    componentName: string,
    units: TranslationUnit[],
    translations: Map<string, string>,
): Promise<BatchMqmResult> {
    if (units.length === 0) return { ok: true, evaluations: new Map() };

    const request = {
        componentName,
        units: units.map((unit) => ({
            id: unit.id,
            kind: unit.kind,
            ownerName: unit.ownerName,
            source: unit.source,
            translated: translations.get(unit.id) ?? '',
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

You will receive failed translation units with their English source text, initial Korean translation, and MQM error feedback.

Rules:
1. Fix every MQM error listed for each unit.
2. Do not change parts that are not covered by any error unless required for grammar.
3. Never translate or alter PascalCase component names, camelCase prop names, quoted enum values, inline code, token names, URLs, or markdown formatting.
4. Respond ONLY with JSON in this exact shape:
{"translations":[{"id":"component.description","translated":"final Korean text"}]}`;

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
            inputs.map((input) => input.unit.id),
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
    componentName: string,
    inputs: BatchPostprocessInput[],
): Promise<BatchPostprocessResult> {
    if (inputs.length === 0) return { ok: true, translations: new Map() };

    const request = {
        componentName,
        units: inputs.map(({ unit, initialTranslation, errors }) => ({
            id: unit.id,
            kind: unit.kind,
            ownerName: unit.ownerName,
            source: unit.source,
            initialTranslation,
            errors,
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

// ─── Component Batch Lifecycle ────────────────────────────────────────────────

interface FailedUnit {
    unit: TranslationUnit;
    initialTranslation: string;
    initialEvaluation: MqmResult;
}

export interface ComponentLifecycleResult {
    outcomes: [TranslationUnit, TranslationOutcome][];
    batchFailureReasons: string[];
}

export async function processComponentLifecycle(
    componentName: string,
    units: TranslationUnit[],
    translations: Map<string, string>,
): Promise<ComponentLifecycleResult> {
    const outcomes: [TranslationUnit, TranslationOutcome][] = [];
    const batchFailureReasons: string[] = [];

    for (const mqmChunk of chunkArray(units, MQM_BATCH_SIZE)) {
        const initialResult = await validateBatchWithMqm(componentName, mqmChunk, translations);

        if (!initialResult.ok) {
            batchFailureReasons.push(
                `${componentName}: initial batch MQM invalid: ${initialResult.reason}`,
            );
            for (const unit of mqmChunk) {
                const translated = translations.get(unit.id);
                if (translated === undefined) {
                    throw new Error(`Missing translation for unit id: ${unit.id}`);
                }
                outcomes.push([unit, degradedOutcome(unit, translated, 'batch_mqm_failed')]);
            }
            continue;
        }

        const failedUnits: FailedUnit[] = [];
        for (const unit of mqmChunk) {
            const translated = translations.get(unit.id);
            const initialEvaluation = initialResult.evaluations.get(unit.id);
            if (translated === undefined || initialEvaluation === undefined) {
                throw new Error(`Missing batch MQM result for id: ${unit.id}`);
            }
            if (initialEvaluation.verdict === 'PASS') {
                outcomes.push([unit, initialPassOutcome(unit, translated)]);
                continue;
            }
            failedUnits.push({ unit, initialTranslation: translated, initialEvaluation });
        }

        for (const failedChunk of chunkArray(failedUnits, POSTPROCESS_BATCH_SIZE)) {
            const postprocess = await postprocessBatchWithLlm(
                componentName,
                failedChunk.map(({ unit, initialTranslation, initialEvaluation }) => ({
                    unit,
                    initialTranslation,
                    errors: initialEvaluation.errors,
                })),
            );

            if (!postprocess.ok) {
                batchFailureReasons.push(
                    `${componentName}: batch postprocess invalid: ${postprocess.reason}`,
                );
                for (const { unit, initialTranslation } of failedChunk) {
                    outcomes.push([
                        unit,
                        degradedOutcome(
                            unit,
                            initialTranslation,
                            'batch_postprocess_failed',
                            initialResult.evaluations.get(unit.id)?.errors,
                        ),
                    ]);
                }
                continue;
            }

            const finalResult = await validateBatchWithMqm(
                componentName,
                failedChunk.map(({ unit }) => unit),
                postprocess.translations,
            );

            if (!finalResult.ok) {
                batchFailureReasons.push(
                    `${componentName}: final batch MQM invalid: ${finalResult.reason}`,
                );
                for (const { unit, initialTranslation } of failedChunk) {
                    const postprocessed =
                        postprocess.translations.get(unit.id) ?? initialTranslation;
                    outcomes.push([
                        unit,
                        degradedOutcome(unit, postprocessed, 'batch_final_mqm_failed'),
                    ]);
                }
                continue;
            }

            for (const failed of failedChunk) {
                const translated = postprocess.translations.get(failed.unit.id);
                const finalEvaluation = finalResult.evaluations.get(failed.unit.id);
                if (translated === undefined || finalEvaluation === undefined) {
                    throw new Error(`Missing final batch MQM result for id: ${failed.unit.id}`);
                }
                outcomes.push([
                    failed.unit,
                    finalOutcome(failed.unit, translated, finalEvaluation),
                ]);
            }
        }
    }

    return { outcomes, batchFailureReasons };
}
