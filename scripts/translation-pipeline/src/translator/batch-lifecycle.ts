import { callLlm } from '~/translation/client';
import { parseLlmJson } from '~/translation/json';
import type {
    MqmError,
    MqmResult,
    TranslationConfig,
    TranslationEvent,
    TranslationOutcome,
    TranslationUnit,
} from '~/types';
import { MQM_EVALUATOR_PROMPT, isMqmError } from '~/validation/validator';

const MQM_BATCH_SIZE = 10;
const POSTPROCESS_BATCH_SIZE = 10;

// ─── Batch MQM ───────────────────────────────────────────────────────────────

const BATCH_MQM_SYSTEM_PROMPT = `${MQM_EVALUATOR_PROMPT}

Batch mode:
You will receive multiple translation units. Evaluate each unit independently.
Respond with EXACTLY this JSON shape and nothing else:
{"evaluations":[{"id":"component.description","verdict":"PASS","errors":[]}]}`;

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

function validateBatchEvaluations(units: TranslationUnit[], evaluations: unknown): BatchMqmResult {
    if (!Array.isArray(evaluations)) {
        return invalidMqm('MQM batch response must contain evaluations[]');
    }

    const expectedIds = new Set(units.map((unit) => unit.id));
    const seen = new Set<string>();
    const result = new Map<string, MqmResult>();

    for (const item of evaluations) {
        if (typeof item !== 'object' || item === null) {
            return invalidMqm('MQM evaluation item must be a JSON object');
        }
        const record = item as Record<string, unknown>;
        if (typeof record.id !== 'string') return invalidMqm('MQM evaluation id must be a string');
        if (!expectedIds.has(record.id)) return invalidMqm(`Unknown evaluation id: ${record.id}`);
        if (seen.has(record.id)) return invalidMqm(`Duplicate evaluation id: ${record.id}`);
        if (record.verdict !== 'PASS' && record.verdict !== 'FAIL') {
            return invalidMqm(`Invalid MQM verdict for id: ${record.id}`);
        }
        if (!Array.isArray(record.errors) || !record.errors.every(isMqmError)) {
            return invalidMqm(`Invalid MQM errors for id: ${record.id}`);
        }
        seen.add(record.id);
        result.set(record.id, { verdict: record.verdict, errors: record.errors });
    }

    for (const unit of units) {
        if (!seen.has(unit.id)) return invalidMqm(`Missing evaluation id: ${unit.id}`);
    }

    return { ok: true, evaluations: result };
}

async function validateBatchWithMqm(
    componentName: string,
    units: TranslationUnit[],
    translations: Map<string, string>,
    config: TranslationConfig,
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
        { model: config.llm.validationModel ?? 'claude-opus-4-7', responseFormat: 'json' },
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

    const expectedIds = new Set(inputs.map((input) => input.unit.id));
    const seen = new Set<string>();
    const result = new Map<string, string>();

    for (const item of translations) {
        if (typeof item !== 'object' || item === null) {
            return invalidPostprocess('Postprocess translation item must be a JSON object');
        }
        const record = item as Record<string, unknown>;
        if (typeof record.id !== 'string') {
            return invalidPostprocess('Postprocess translation id must be a string');
        }
        if (!expectedIds.has(record.id)) {
            return invalidPostprocess(`Unknown translation id: ${record.id}`);
        }
        if (seen.has(record.id)) {
            return invalidPostprocess(`Duplicate translation id: ${record.id}`);
        }
        if (typeof record.translated !== 'string') {
            return invalidPostprocess(`Translated text must be a string for id: ${record.id}`);
        }
        if (record.translated.trim().length === 0) {
            return invalidPostprocess(`Empty translation for id: ${record.id}`);
        }
        seen.add(record.id);
        result.set(record.id, record.translated);
    }

    for (const input of inputs) {
        if (!seen.has(input.unit.id)) {
            return invalidPostprocess(`Missing translation id: ${input.unit.id}`);
        }
    }

    return { ok: true, translations: result };
}

async function postprocessBatchWithLlm(
    componentName: string,
    inputs: BatchPostprocessInput[],
    model?: string,
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
        { model, responseFormat: 'json' },
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

function makeEvent(stage: TranslationEvent['stage'], message: string): TranslationEvent {
    return { stage, message };
}

function initialPassOutcome(
    unit: TranslationUnit,
    translated: string,
    initialEvaluation: MqmResult,
): TranslationOutcome {
    return {
        id: unit.id,
        source: unit.source,
        translated,
        assurance: 'verified',
        reportable: false,
        reason: 'initial_quality_gate_passed',
        initialEvaluation,
        events: [
            makeEvent('translation', 'Initial translation received.'),
            makeEvent('mqm', 'Initial MQM PASS.'),
        ],
    };
}

function finalOutcome(
    unit: TranslationUnit,
    initialTranslation: string,
    initialEvaluation: MqmResult,
    translated: string,
    finalEvaluation: MqmResult,
): TranslationOutcome {
    const passed = finalEvaluation.verdict === 'PASS';
    return {
        id: unit.id,
        source: unit.source,
        translated,
        assurance: passed ? 'verified' : 'unverified',
        reportable: !passed,
        reason: passed ? 'final_quality_gate_passed' : 'final_quality_gate_failed',
        initialTranslation,
        initialEvaluation,
        finalEvaluation,
        events: [
            makeEvent('translation', 'Initial translation received.'),
            makeEvent('mqm', `Initial MQM ${initialEvaluation.verdict}.`),
            makeEvent('postprocess', 'Postprocess translation received.'),
            makeEvent('mqm', `Final MQM ${finalEvaluation.verdict}.`),
        ],
    };
}

function degradedOutcome(
    unit: TranslationUnit,
    translated: string,
    reason: 'batch_mqm_failed' | 'batch_postprocess_failed' | 'batch_final_mqm_failed',
): TranslationOutcome {
    return {
        id: unit.id,
        source: unit.source,
        translated,
        assurance: 'unverified',
        reportable: true,
        reason,
        events: [
            makeEvent('translation', 'Initial translation received.'),
            makeEvent(
                'mqm',
                `Batch ${reason.replace('batch_', '').replace('_failed', '')} failed — degraded.`,
            ),
        ],
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
    config: TranslationConfig,
): Promise<ComponentLifecycleResult> {
    const outcomes: [TranslationUnit, TranslationOutcome][] = [];
    const batchFailureReasons: string[] = [];

    for (const mqmChunk of chunkArray(units, MQM_BATCH_SIZE)) {
        const initialResult = await validateBatchWithMqm(
            componentName,
            mqmChunk,
            translations,
            config,
        );

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
                outcomes.push([unit, initialPassOutcome(unit, translated, initialEvaluation)]);
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
                config.llm.postprocessModel,
            );

            if (!postprocess.ok) {
                batchFailureReasons.push(
                    `${componentName}: batch postprocess invalid: ${postprocess.reason}`,
                );
                for (const { unit, initialTranslation } of failedChunk) {
                    outcomes.push([
                        unit,
                        degradedOutcome(unit, initialTranslation, 'batch_postprocess_failed'),
                    ]);
                }
                continue;
            }

            const finalResult = await validateBatchWithMqm(
                componentName,
                failedChunk.map(({ unit }) => unit),
                postprocess.translations,
                config,
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
                    finalOutcome(
                        failed.unit,
                        failed.initialTranslation,
                        failed.initialEvaluation,
                        translated,
                        finalEvaluation,
                    ),
                ]);
            }
        }
    }

    return { outcomes, batchFailureReasons };
}
