import { callLlm } from '~/translate/llm-client';
import type { MqmCategory, MqmError, MqmResult, TranslationConfig } from '~/translate/types';

const SYSTEM_PROMPT = `You are a design-system documentation translation quality evaluator. Respond ONLY with a single JSON object — no explanation, no markdown, no code fences.

Evaluate the Korean translation of a JSDoc comment using the MQM taxonomy below. For each error, return the exact substring from the source (source_span) and the exact substring from the translation (mt_span) that contains the error.

Use one of these categories exactly:

Standard dimensions:
- Terminology/Component name inconsistency — component names are translated or rendered inconsistently across pages
- Terminology/Token name altered — design token names are translated, altered, or normalized
- Terminology/Prop name mistranslated — prop names are translated, altered, or mistranslated
- Accuracy/Mistranslation — source meaning is distorted or communicated differently
- Accuracy/Omission — important source information is missing
- Accuracy/Addition — information not present in the source is added
- Fluency/Unnatural phrasing — grammatically valid but awkward literal phrasing
- Fluency/Style inconsistency — tone and voice are inconsistent within the docs
- Fluency/Grammatical error — grammar error in Korean

Design-system specific dimensions:
- Markup & Code/Code block translated — text inside code blocks or inline code is translated or altered
- Markup & Code/Link / anchor broken — hrefs, anchors, or link targets are damaged
- Markup & Code/Markdown structure altered — heading, table, list, emphasis, or inline-code structure is changed
- Cross-reference/Inter-page inconsistency — the same term is translated differently across pages
- Cross-reference/See also mismatch — related-document link text no longer matches its target
- Locale/Number / unit format — number or unit formatting is wrong for Korean docs
- Locale/Directional text — LTR/RTL directionality is broken

Severity:
- critical: a developer could implement incorrectly, or a mandatory rule is violated. Examples: prop/type mistranslation, code block translation, broken markdown/code structure.
- major: seriously harms understanding or trust. Examples: behavior description distorted, important explanation omitted, non-source content added.
- minor: lowers expression quality but does not block understanding. Examples: awkward literal phrasing, typo, style inconsistency.

Write explanation in Korean. Keep category and severity values in English exactly as specified.
If no errors exist, return errors as an empty array.

Respond with EXACTLY this JSON shape and nothing else:
{"verdict":"PASS","errors":[]}
or
{"verdict":"FAIL","errors":[{"category":"Terminology/Prop name mistranslated","severity":"critical","source_span":"onClick","mt_span":"클릭","explanation":"prop 이름은 번역하면 안 됩니다."}]}`;

const passResult = (): MqmResult => ({ verdict: 'PASS', errors: [] });
const degradedResult = (): MqmResult => ({ verdict: 'PASS', errors: [], degraded: true });

// MqmCategory 유니온에서 파생 — 카테고리 추가/삭제는 types.ts 한 곳에서만
const MQM_CATEGORIES: Set<MqmCategory> = new Set([
    'Terminology/Component name inconsistency',
    'Terminology/Token name altered',
    'Terminology/Prop name mistranslated',
    'Accuracy/Mistranslation',
    'Accuracy/Omission',
    'Accuracy/Addition',
    'Fluency/Unnatural phrasing',
    'Fluency/Style inconsistency',
    'Fluency/Grammatical error',
    'Markup & Code/Code block translated',
    'Markup & Code/Link / anchor broken',
    'Markup & Code/Markdown structure altered',
    'Cross-reference/Inter-page inconsistency',
    'Cross-reference/See also mismatch',
    'Locale/Number / unit format',
    'Locale/Directional text',
] satisfies MqmCategory[]);

const MQM_SEVERITIES = new Set<MqmError['severity']>(['minor', 'major', 'critical']);

function isMqmError(value: unknown): value is MqmError {
    if (typeof value !== 'object' || value === null) {
        return false;
    }

    const error = value as Record<string, unknown>;
    return (
        typeof error.category === 'string' &&
        MQM_CATEGORIES.has(error.category as MqmError['category']) &&
        typeof error.severity === 'string' &&
        MQM_SEVERITIES.has(error.severity as MqmError['severity']) &&
        typeof error.source_span === 'string' &&
        error.source_span.trim().length > 0 &&
        typeof error.mt_span === 'string' &&
        error.mt_span.trim().length > 0 &&
        typeof error.explanation === 'string'
    );
}

export async function validateWithMqm(
    source: string,
    translated: string,
    config: TranslationConfig,
): Promise<MqmResult> {
    if (!config.llm.enabled || !config.validation.mqm.enabled) {
        return passResult();
    }

    const userPrompt = `[원문 JSDoc]: ${source}\n[번역 JSDoc]: ${translated}`;

    const result = await callLlm(
        [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userPrompt },
        ],
        config.llm.validationModel,
    );

    if (!result.content) {
        const statusInfo = result.statusCode !== undefined ? ` (HTTP ${result.statusCode})` : '';
        console.warn(`[mqm-validator] ${result.error}${statusInfo}. Returning PASS (degraded).`);
        return degradedResult();
    }

    try {
        // Strip markdown code fences
        let jsonStr = result.content
            .replace(/^```(?:json)?\s*/i, '')
            .replace(/\s*```$/, '')
            .trim();
        // Extract first {...} block if response isn't clean JSON
        if (!jsonStr.startsWith('{')) {
            const match = jsonStr.match(/\{[\s\S]*\}/);
            if (match) jsonStr = match[0];
        }
        const parsed = JSON.parse(jsonStr) as unknown;
        const p = parsed as Record<string, unknown>;
        if (
            typeof parsed !== 'object' ||
            parsed === null ||
            (p.verdict !== 'PASS' && p.verdict !== 'FAIL') ||
            !Array.isArray(p.errors) ||
            !(p.errors as unknown[]).every(isMqmError)
        ) {
            console.warn(
                '[mqm-validator] Unexpected JSON shape from LLM. Returning PASS (degraded).',
            );
            return degradedResult();
        }
        return {
            verdict: p.verdict,
            errors: p.errors,
        };
    } catch {
        console.warn(
            `[mqm-validator] Failed to parse MQM response as JSON. Raw: ${result.content.slice(0, 300)}`,
        );
        return degradedResult();
    }
}
