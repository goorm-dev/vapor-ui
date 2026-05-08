import { callLlm, logLlmMetadata } from '~/translate/llm-client';
import { parseLlmJson } from '~/translate/llm-json';
import { MQM_EVALUATOR_PROMPT, isMqmError } from '~/translate/mqm-validator';
import type { MqmResult, TranslationConfig, TranslationUnit } from '~/translate/types';

const DEFAULT_VALIDATION_MODEL = 'claude-opus-4-7';

const SYSTEM_PROMPT = `${MQM_EVALUATOR_PROMPT}

Batch mode:
You will receive multiple translation units. Evaluate each unit independently.
Respond with EXACTLY this JSON shape and nothing else:
{"evaluations":[{"id":"component.description","verdict":"PASS","errors":[]}]}`;

export interface BatchMqmSuccess {
    ok: true;
    evaluations: Map<string, MqmResult>;
}

export interface BatchMqmInvalid {
    ok: false;
    reason: string;
}

export type BatchMqmResult = BatchMqmSuccess | BatchMqmInvalid;

function invalid(reason: string): BatchMqmInvalid {
    return { ok: false, reason };
}

function validateEvaluations(units: TranslationUnit[], evaluations: unknown): BatchMqmResult {
    if (!Array.isArray(evaluations)) {
        return invalid('MQM batch response must contain evaluations[]');
    }

    const expectedIds = new Set(units.map((unit) => unit.id));
    const seen = new Set<string>();
    const result = new Map<string, MqmResult>();

    for (const item of evaluations) {
        if (typeof item !== 'object' || item === null) {
            return invalid('MQM evaluation item must be a JSON object');
        }
        const record = item as Record<string, unknown>;
        if (typeof record.id !== 'string') {
            return invalid('MQM evaluation id must be a string');
        }
        if (!expectedIds.has(record.id)) {
            return invalid(`Unknown evaluation id: ${record.id}`);
        }
        if (seen.has(record.id)) {
            return invalid(`Duplicate evaluation id: ${record.id}`);
        }
        if (record.verdict !== 'PASS' && record.verdict !== 'FAIL') {
            return invalid(`Invalid MQM verdict for id: ${record.id}`);
        }
        if (!Array.isArray(record.errors) || !record.errors.every(isMqmError)) {
            return invalid(`Invalid MQM errors for id: ${record.id}`);
        }

        seen.add(record.id);
        result.set(record.id, {
            verdict: record.verdict,
            errors: record.errors,
        });
    }

    for (const unit of units) {
        if (!seen.has(unit.id)) {
            return invalid(`Missing evaluation id: ${unit.id}`);
        }
    }

    return { ok: true, evaluations: result };
}

export async function validateBatchWithMqm(
    componentName: string,
    units: TranslationUnit[],
    translations: Map<string, string>,
    config: TranslationConfig,
    log?: (message: string) => void,
    logLabel = `batchMqm ${componentName}`,
): Promise<BatchMqmResult> {
    if (units.length === 0) {
        return { ok: true, evaluations: new Map() };
    }

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
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: JSON.stringify(request) },
        ],
        {
            model: config.llm.validationModel ?? DEFAULT_VALIDATION_MODEL,
            responseFormat: 'json',
        },
    );
    logLlmMetadata(log, logLabel, result);

    if (!result.content) {
        const statusInfo = result.statusCode !== undefined ? ` (HTTP ${result.statusCode})` : '';
        return invalid(`[batch-mqm] ${result.error ?? 'empty response'}${statusInfo}`);
    }

    try {
        const parsed = parseLlmJson(result.content);
        if (typeof parsed !== 'object' || parsed === null) {
            return invalid('MQM batch response must be a JSON object');
        }
        return validateEvaluations(units, (parsed as Record<string, unknown>).evaluations);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return invalid(`Failed to parse MQM batch response: ${message}`);
    }
}
