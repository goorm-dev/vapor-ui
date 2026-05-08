import { callLlm, logLlmMetadata } from '~/translate/llm-client';
import { parseLlmJson } from '~/translate/llm-json';
import type { MqmError, TranslationUnit } from '~/translate/types';

const SYSTEM_PROMPT = `You are a professional Korean translator and post-editor for a design system documentation site.

You will receive failed translation units with their English source text, initial Korean translation, and MQM error feedback.

Rules:
1. Fix every MQM error listed for each unit.
2. Do not change parts that are not covered by any error unless required for grammar.
3. Never translate or alter PascalCase component names, camelCase prop names, quoted enum values, inline code, token names, URLs, or markdown formatting.
4. Respond ONLY with JSON in this exact shape:
{"translations":[{"id":"component.description","translated":"final Korean text"}]}`;

export interface BatchPostprocessInput {
    unit: TranslationUnit;
    initialTranslation: string;
    errors: MqmError[];
}

export interface BatchPostprocessSuccess {
    ok: true;
    translations: Map<string, string>;
}

export interface BatchPostprocessInvalid {
    ok: false;
    reason: string;
}

export type BatchPostprocessResult = BatchPostprocessSuccess | BatchPostprocessInvalid;

function invalid(reason: string): BatchPostprocessInvalid {
    return { ok: false, reason };
}

function validateTranslations(
    inputs: BatchPostprocessInput[],
    translations: unknown,
): BatchPostprocessResult {
    if (!Array.isArray(translations)) {
        return invalid('Postprocess batch response must contain translations[]');
    }

    const expectedIds = new Set(inputs.map((input) => input.unit.id));
    const seen = new Set<string>();
    const result = new Map<string, string>();

    for (const item of translations) {
        if (typeof item !== 'object' || item === null) {
            return invalid('Postprocess translation item must be a JSON object');
        }
        const record = item as Record<string, unknown>;
        if (typeof record.id !== 'string') {
            return invalid('Postprocess translation id must be a string');
        }
        if (!expectedIds.has(record.id)) {
            return invalid(`Unknown translation id: ${record.id}`);
        }
        if (seen.has(record.id)) {
            return invalid(`Duplicate translation id: ${record.id}`);
        }
        if (typeof record.translated !== 'string') {
            return invalid(`Translated text must be a string for id: ${record.id}`);
        }
        if (record.translated.trim().length === 0) {
            return invalid(`Empty translation for id: ${record.id}`);
        }

        seen.add(record.id);
        result.set(record.id, record.translated);
    }

    for (const input of inputs) {
        if (!seen.has(input.unit.id)) {
            return invalid(`Missing translation id: ${input.unit.id}`);
        }
    }

    return { ok: true, translations: result };
}

export async function postprocessBatchWithLlm(
    componentName: string,
    inputs: BatchPostprocessInput[],
    model?: string,
    log?: (message: string) => void,
    logLabel = `batchPostprocess ${componentName}`,
): Promise<BatchPostprocessResult> {
    if (inputs.length === 0) {
        return { ok: true, translations: new Map() };
    }

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
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: JSON.stringify(request) },
        ],
        { model, responseFormat: 'json' },
    );
    logLlmMetadata(log, logLabel, result);

    if (!result.content) {
        const statusInfo = result.statusCode !== undefined ? ` (HTTP ${result.statusCode})` : '';
        return invalid(`[batch-postprocess] ${result.error ?? 'empty response'}${statusInfo}`);
    }

    try {
        const parsed = parseLlmJson(result.content);
        if (typeof parsed !== 'object' || parsed === null) {
            return invalid('Postprocess batch response must be a JSON object');
        }
        return validateTranslations(inputs, (parsed as Record<string, unknown>).translations);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return invalid(`Failed to parse postprocess batch response: ${message}`);
    }
}
