import { type BatchResult, callBatch } from '~/batch-call';
import type { MqmResult } from '~/batch/_types';
import { DEFAULT_VALIDATION_MODEL } from '~/defaults';
import {
    type MqmCategory,
    type MqmError,
    type TranslationUnit,
    getTranslationUnitKey,
} from '~/domain';

const MQM_EVALUATOR_PROMPT = `You are a design-system documentation translation quality evaluator. Respond ONLY with a single JSON object — no explanation, no markdown, no code fences.

Evaluate the Korean translation of a JSDoc comment using the MQM taxonomy below. For each error, return the exact substring from the source (source_span) and the exact substring from the translation (mt_span) that contains the error.

Use one of these categories exactly:

- Accuracy/Mistranslation — source meaning is distorted or communicated differently
- Accuracy/Omission — important source information is missing
- Accuracy/Addition — information not present in the source is added
- Fluency/Unnatural phrasing — grammatically valid but awkward literal phrasing. Flag these patterns even if grammatically correct: "~를 제어합니다" (prefer "~지정합니다" or "~설정합니다"), "~를 수행합니다" (use a direct verb), "~에 적용되는" (prefer "~에 줄"), "~를 반환하는 함수입니다" (prefer dropping final 이다), abstract-noun subjects where the component or developer should be the subject
- Fluency/Style inconsistency — tone and voice are inconsistent within the docs
- Fluency/Grammatical error — grammar error in Korean

Do NOT report code-span, identifier, URL, or markdown-structure preservation problems — a separate
deterministic checker owns those. Judge only meaning and Korean fluency.

Severity:
- critical: a developer could implement incorrectly. Example: the described behavior is inverted.
- major: seriously harms understanding or trust. Examples: behavior description distorted, important explanation omitted, non-source content added.
- minor: lowers expression quality but does not block understanding. Examples: awkward literal phrasing, typo, style inconsistency.

Write explanation in Korean. Keep category and severity values in English exactly as specified.
If no errors exist, return errors as an empty array.`;

// MqmCategory 유니온에서 파생 — 카테고리 추가/삭제는 domain.ts 한 곳에서만
const MQM_CATEGORY_VALUES = [
    'Accuracy/Mistranslation',
    'Accuracy/Omission',
    'Accuracy/Addition',
    'Fluency/Unnatural phrasing',
    'Fluency/Style inconsistency',
    'Fluency/Grammatical error',
] satisfies MqmCategory[];

const MQM_SEVERITY_VALUES = ['minor', 'major', 'critical'] satisfies MqmError['severity'][];

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

export async function validateBatchWithMqm(
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
