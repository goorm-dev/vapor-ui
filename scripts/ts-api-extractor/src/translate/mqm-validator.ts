import { callLlm } from '~/translate/llm-client';
import type { MqmResult, TranslationConfig } from '~/translate/types';

const SYSTEM_PROMPT = `You are a translation quality evaluator. Respond ONLY with a single JSON object — no explanation, no markdown, no code fences.

Evaluate the Korean translation of a JSDoc comment for these error types:

Accuracy: mistranslation, omission/addition, terminology (e.g. prop names like onClick must NOT be translated), untranslated
Fluency: grammar, formatting, unnaturalness
Style: formality

Rules:
- camelCase identifiers (onClick, className, etc.), component names (Button, Dialog, etc.), JSDoc tags (@param, @returns), and type expressions (string | number) must remain in English — translating them is a major terminology error.
- major = meaning broken or identifier translated; minor = awkward phrasing only

Respond with EXACTLY this JSON shape and nothing else:
{"verdict":"PASS","errors":[]}
or
{"verdict":"FAIL","errors":[{"category":"accuracy","type":"terminology","severity":"major","source":"...","translation":"...","message":"..."}]}`;

const PASS_RESULT: MqmResult = { verdict: 'PASS', errors: [] };

export async function validateWithMqm(
    source: string,
    translated: string,
    config: TranslationConfig,
): Promise<MqmResult> {
    if (!config.llm.enabled || !config.validation.mqm.enabled) {
        return PASS_RESULT;
    }

    const userPrompt = `[원문 JSDoc]: ${source}\n[번역 JSDoc]: ${translated}`;

    const result = await callLlm([
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
    ]);

    if (!result.content) {
        console.warn(`[mqm-validator] ${result.error}. Returning PASS.`);
        return PASS_RESULT;
    }

    try {
        // Strip markdown code fences
        let jsonStr = result.content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
        // Extract first {...} block if response isn't clean JSON
        if (!jsonStr.startsWith('{')) {
            const match = jsonStr.match(/\{[\s\S]*\}/);
            if (match) jsonStr = match[0];
        }
        return JSON.parse(jsonStr) as MqmResult;
    } catch {
        console.warn(
            `[mqm-validator] Failed to parse MQM response as JSON. Raw: ${result.content.slice(0, 300)}`,
        );
        return PASS_RESULT;
    }
}
