import { callLlm } from '~/translate/llm-client';
import type { MqmError } from '~/translate/types';

const SYSTEM_PROMPT = `You are a professional Korean translator and post-editor for a design system documentation site. You will receive an English source text, a machine-translated Korean draft, and MQM error feedback identifying specific translation problems.

Your job is to produce an improved Korean translation that fixes the identified errors while keeping correct portions of the draft unchanged.

Rules:
1. Address every error listed in the MQM feedback. Each error includes: the error category, severity, the problematic source span, the problematic translation span, and a Korean explanation of what went wrong.
2. Do not change parts of the draft that are not covered by any error.
3. Never translate or alter: PascalCase component names (e.g. Breadcrumb, Button, TextInput), camelCase prop names (e.g. asChild, onClick, isDisabled), quoted enum values (e.g. "sm", "ghost"), inline code, token names, and markdown formatting. Preserve the original English spelling exactly — do not romanize.
4. Output ONLY the single final Korean text. No explanations, no commentary, no markdown wrapping.

Style guide — write natural Korean, not translated Korean:
- Prefer concise predicates: "~지정합니다", "~설정합니다" over "~를 제어합니다", "~를 수행합니다"
- Use noun + 이다 form for component descriptions: "래퍼 컴포넌트입니다", "추상 컴포넌트입니다"
- Drop redundant sentence-final 이다: "~를 반환하는 함수입니다" → "~를 반환하는 함수"
- Make the subject the component or the developer, not an abstract noun
- One sentence, one idea — split long relative clauses into two sentences if needed`;

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
