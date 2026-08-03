import { type BatchResult, callBatch } from '~/batch-call';
import type { FailedUnit } from '~/batch/_types';
import { DEFAULT_POSTPROCESS_MODEL } from '~/defaults';
import { getTranslationUnitKey, getUnitOwnerName } from '~/domain';
import { describeViolation } from '~/preserve';

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

export async function postprocessBatchWithLlm(
    inputs: FailedUnit[],
): Promise<BatchResult<Map<string, string>>> {
    if (inputs.length === 0) return { ok: true, value: new Map() };

    const request = {
        units: inputs.map(({ unit, initialTranslation, errors, violations }) => ({
            id: getTranslationUnitKey(unit),
            kind: unit.kind,
            ownerName: getUnitOwnerName(unit),
            componentName: unit.componentDisplayName,
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
