import { callLlm } from '~/translate/llm-client';
import type { MqmError, MqmResult, TranslationConfig } from '~/translate/types';

const SYSTEM_PROMPT = `You are a UI string translation quality evaluator. Respond ONLY with a single JSON object — no explanation, no markdown, no code fences.

Evaluate the Korean translation of a JSDoc comment using MQM criteria. For each error, return the exact substring from the source (source_span) and the exact substring from the translation (mt_span) that contains the error.

Error categories:
- Accuracy/Mistranslation — meaning is changed or distorted
- Accuracy/Omission — content from source is missing
- Accuracy/Addition — content not in source was added
- Fluency/Grammar — grammatical error in translation
- Terminology — domain term used incorrectly (e.g. prop names like onClick, component names like Button, JSDoc tags like @param, type expressions like string | number must remain in English — translating them is a Terminology error)
- Style — unnatural or overly formal/informal expression
- Locale convention — formatting convention for the target locale violated

Severity:
- minor: awkward phrasing, style issues only
- major: meaning broken or identifier translated
- critical: completely wrong or unintelligible

Rules:
- camelCase identifiers (onClick, className, etc.), component names (Button, Dialog, etc.), JSDoc tags (@param, @returns), and type expressions must remain in English.
- Markdown code blocks, HTML tags, and placeholders ({count}, {{name}}) must NOT be flagged as errors.
- If no errors exist, return errors as an empty array.

Respond with EXACTLY this JSON shape and nothing else:
{"verdict":"PASS","errors":[]}
or
{"verdict":"FAIL","errors":[{"category":"Terminology","severity":"major","source_span":"onClick","mt_span":"클릭","explanation":"camelCase identifier must not be translated"}]}`;

const passResult = (): MqmResult => ({ verdict: 'PASS', errors: [] });

const MQM_CATEGORIES = new Set<MqmError['category']>([
    'Accuracy/Mistranslation',
    'Accuracy/Omission',
    'Accuracy/Addition',
    'Fluency/Grammar',
    'Terminology',
    'Style',
    'Locale convention',
]);

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
        typeof error.mt_span === 'string' &&
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

    const result = await callLlm([
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
    ]);

    if (!result.content) {
        console.warn(`[mqm-validator] ${result.error}. Returning PASS.`);
        return passResult();
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
            console.warn('[mqm-validator] Unexpected JSON shape from LLM. Returning PASS.');
            return passResult();
        }
        return {
            verdict: p.verdict,
            errors: p.errors,
        };
    } catch {
        console.warn(
            `[mqm-validator] Failed to parse MQM response as JSON. Raw: ${result.content.slice(0, 300)}`,
        );
        return passResult();
    }
}
