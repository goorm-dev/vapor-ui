import { callLlm } from '~/translate/llm-client';
import type { MqmError } from '~/translate/types';

const SYSTEM_PROMPT = `You are a professional Korean translator and post-editor for a design system documentation site. You will receive an English source text, a machine-translated Korean draft, and MQM error feedback identifying specific translation problems.

Your job is to produce an improved Korean translation that fixes the identified errors while keeping correct portions of the draft unchanged.

Rules:
1. Address every error listed in the MQM feedback. Each error includes: the error category, severity, the problematic source span, the problematic translation span, and a Korean explanation of what went wrong.
2. Do not change parts of the draft that are not covered by any error.
3. Preserve all inline code, prop names, component names, token names, and markdown formatting exactly — never translate or alter these.
4. Output ONLY the single final Korean text. No explanations, no commentary, no markdown wrapping.`;

function buildRewritePrompt(source: string, mtOutput: string, errors: MqmError[]): string {
    const errorLines = errors.map(
        (e, i) =>
            `${i + 1}. [${e.severity.toUpperCase()}] ${e.category}\n   원문 구간: "${e.source_span}"\n   번역 구간: "${e.mt_span}"\n   문제: ${e.explanation}`,
    );

    return (
        `Source (English):\n${source}\n\n` +
        `Draft (DeepL Korean):\n${mtOutput}\n\n` +
        `MQM errors to fix (${errors.length}):\n${errorLines.join('\n\n')}`
    );
}

export interface PostprocessResult {
    translated: string;
    degraded?: true;
}

export async function postprocessWithLlm(
    source: string,
    mtOutput: string,
    errors: MqmError[] = [],
    model?: string,
): Promise<PostprocessResult> {
    const userPrompt = buildRewritePrompt(source, mtOutput, errors);

    const result = await callLlm(
        [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userPrompt },
        ],
        model,
    );

    if (!result.content) {
        const statusInfo = result.statusCode !== undefined ? ` (HTTP ${result.statusCode})` : '';
        console.warn(
            `[llm-postprocess] ${result.error}${statusInfo}. Returning DeepL draft as-is (degraded).`,
        );
        return { translated: mtOutput, degraded: true };
    }

    // Strip markdown code fences if LLM wraps the output
    const cleaned = result.content
        .replace(/^```(?:\w+)?\s*/i, '')
        .replace(/\s*```$/, '')
        .trim();
    return { translated: cleaned || mtOutput };
}
