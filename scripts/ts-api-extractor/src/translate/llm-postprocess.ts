import { callLlm } from '~/translate/llm-client';
import type { MqmError } from '~/translate/types';

const SYSTEM_PROMPT = `You are a professional Korean translator and post-editor. You will receive an English source text and a machine-translated Korean draft along with MQM error feedback. Your job is to fix ONLY the error spans listed in the feedback — preserving the rest of the draft exactly as-is.

Rules:
1. Fix only the mt_span portions listed in the errors. Do not change anything else.
2. no_edit_spans listed below must remain character-for-character identical in your output.
3. UI component terms (e.g. breadcrumb, checkbox, dialog) must be transliterated in Korean (브레드크럼, 체크박스, 다이얼로그), never translated literally.
4. camelCase identifiers (onClick, className, children, etc.), JSDoc tags (@param, @returns), and type expressions (string | number) must remain in English.
5. Markdown code blocks (\`...\`), HTML tags, and placeholders ({...}, {{...}}) must be preserved exactly.
6. Output ONLY the single final Korean text.
7. Do NOT output multiple versions, explanations, commentary, or markdown wrapping.`;

function buildRewritePrompt(
    source: string,
    mtOutput: string,
    errors: MqmError[],
    noEditSpans: string[],
): string {
    const errorLines = errors.map(
        (e) =>
            `- [${e.severity.toUpperCase()} ${e.category}] source: "${e.source_span}" → mt: "${e.mt_span}": ${e.explanation}`,
    );

    const noEditSection =
        noEditSpans.length > 0
            ? `\n\nno_edit_spans (must remain unchanged):\n${noEditSpans.map((s) => `- "${s}"`).join('\n')}`
            : '';

    return (
        `Source (English):\n${source}\n\n` +
        `Draft (DeepL Korean):\n${mtOutput}\n\n` +
        `Errors to fix:\n${errorLines.join('\n')}` +
        noEditSection
    );
}

export async function postprocessWithLlm(
    source: string,
    mtOutput: string,
    errors: MqmError[] = [],
    noEditSpans: string[] = [],
): Promise<string> {
    const userPrompt = buildRewritePrompt(source, mtOutput, errors, noEditSpans);

    const result = await callLlm([
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
    ]);

    if (!result.content) {
        console.warn(`[llm-postprocess] ${result.error}. Returning DeepL draft as-is.`);
        return mtOutput;
    }

    // Strip markdown code fences if LLM wraps the output
    const cleaned = result.content
        .replace(/^```(?:\w+)?\s*/i, '')
        .replace(/\s*```$/, '')
        .trim();
    return cleaned || mtOutput;
}
