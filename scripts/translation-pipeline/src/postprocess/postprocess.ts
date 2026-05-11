import { callLlm, logLlmMetadata } from '~/translation/client';
import { parseLlmJson } from '~/translation/json';
import type { MqmError } from '~/types';

const SYSTEM_PROMPT = `You are a professional Korean translator and post-editor for a design system documentation site. You will receive an English source text, a machine-translated Korean draft, and MQM error feedback identifying specific translation problems.

Your job is to produce an improved Korean translation that fixes the identified errors while keeping correct portions of the draft unchanged.

Rules:
1. Address every error listed in the MQM feedback. Each error includes: the error category, severity, the problematic source span, the problematic translation span, and a Korean explanation of what went wrong.
2. Do not change parts of the draft that are not covered by any error.
3. Never translate or alter: PascalCase component names (e.g. Breadcrumb, Button, TextInput), camelCase prop names (e.g. asChild, onClick, isDisabled), quoted enum values (e.g. "sm", "ghost"), inline code, token names, and markdown formatting. Preserve the original English spelling exactly — do not romanize.
4. Respond ONLY with JSON in this exact shape: {"translated":"final Korean text"}.

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
        `Initial Korean translation:\n${mtOutput}\n\n` +
        `MQM errors to fix (${errors.length}):\n${errorLines.join('\n\n')}`
    );
}

export interface PostprocessResult {
    translated: string;
    invalid?: true;
}

function invalidResult(mtOutput: string): PostprocessResult {
    return { translated: mtOutput, invalid: true };
}

function parseTranslated(content: string): string | undefined {
    try {
        const parsed = parseLlmJson(content);
        if (typeof parsed !== 'object' || parsed === null) return undefined;
        const translated = (parsed as Record<string, unknown>).translated;
        if (typeof translated !== 'string' || translated.trim().length === 0) {
            return undefined;
        }
        return translated;
    } catch {
        return undefined;
    }
}

export async function postprocessWithLlm(
    source: string,
    mtOutput: string,
    errors: MqmError[] = [],
    model?: string,
    log?: (message: string) => void,
    logLabel = 'postprocess',
): Promise<PostprocessResult> {
    const userPrompt = buildRewritePrompt(source, mtOutput, errors);

    const result = await callLlm(
        [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userPrompt },
        ],
        { model, responseFormat: 'json' },
    );
    logLlmMetadata(log, logLabel, result);

    if (!result.content) {
        const statusInfo = result.statusCode !== undefined ? ` (HTTP ${result.statusCode})` : '';
        console.warn(
            `[llm-postprocess] ${result.error}${statusInfo}. Returning initial translation as-is.`,
        );
        return invalidResult(mtOutput);
    }

    const translated = parseTranslated(result.content);
    if (!translated) {
        console.warn(
            `[llm-postprocess] Unexpected JSON response shape. Raw: ${result.content.slice(0, 300)}`,
        );
        return invalidResult(mtOutput);
    }

    return { translated };
}
