import { callLlm } from '~/translate/llm-client';
import type { MqmError } from '~/translate/types';

const SYSTEM_PROMPT = `You are a professional Korean translator and post-editor. You will receive an English source text and a machine-translated Korean draft. Your job is to post-edit the draft to fix any errors in accuracy, fluency, terminology, and style — while preserving as much of the original draft as possible. Do not retranslate from scratch unless the draft is critically wrong.

Rules:
- UI component terms (e.g. breadcrumb, checkbox, dialog) must be transliterated in Korean (브레드크럼, 체크박스, 다이얼로그), never translated literally.
- camelCase identifiers (onClick, className, children, etc.), JSDoc tags (@param, @returns), and type expressions (string | number) must remain in English.
- Output ONLY the single final Korean text.
- Do NOT output multiple versions or alternatives.
- Do NOT append a second translation after the first.
- Do NOT include any explanation, commentary, or separator.`;

function buildFeedbackPrompt(errors: MqmError[]): string {
    if (errors.length === 0) return '';
    const lines = errors.map(
        (e) =>
            `- [${e.severity.toUpperCase()} ${e.category}/${e.type}] "${e.source}" → "${e.translation}": ${e.message}`,
    );
    return `\n\nThe previous translation had the following errors that MUST be fixed:\n${lines.join('\n')}`;
}

export async function postprocessWithLlm(
    source: string,
    deeplDraft: string,
    mqmErrors: MqmError[] = [],
): Promise<string> {
    const userPrompt = `Source (English):\n${source}\n\nDraft (DeepL Korean):\n${deeplDraft}${buildFeedbackPrompt(mqmErrors)}`;

    const result = await callLlm([
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
    ]);

    if (!result.content) {
        console.warn(`[llm-postprocess] ${result.error}. Returning DeepL draft as-is.`);
        return deeplDraft;
    }

    // Strip markdown code fences if LLM wraps the output
    const cleaned = result.content
        .replace(/^```(?:\w+)?\s*/i, '')
        .replace(/\s*```$/, '')
        .trim();
    return cleaned || deeplDraft;
}
