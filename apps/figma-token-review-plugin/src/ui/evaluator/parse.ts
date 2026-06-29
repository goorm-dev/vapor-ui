import type { ScanPayload } from '~/shared/schema';

type AnthropicTextBlock = { type: 'text'; text: string };
type AnthropicContentBlock = AnthropicTextBlock | { type: string; [key: string]: unknown };

export type AnthropicMessagesResponse = {
    content?: AnthropicContentBlock[];
};

export class EvaluatorParseError extends Error {
    readonly raw: string | null;
    constructor(message: string, raw: string | null) {
        super(message);
        this.name = 'EvaluatorParseError';
        this.raw = raw;
    }
}

export function parseScanPayload(response: AnthropicMessagesResponse): ScanPayload {
    const blocks = response.content ?? [];
    const lastText = [...blocks]
        .reverse()
        .find((b): b is AnthropicTextBlock => b.type === 'text' && typeof b.text === 'string');

    if (!lastText) {
        throw new EvaluatorParseError('LLM 응답에 text block이 없습니다.', null);
    }

    const json = extractJsonObject(lastText.text);
    if (!json) {
        throw new EvaluatorParseError('LLM 응답에서 JSON 객체를 찾을 수 없습니다.', lastText.text);
    }

    let parsed: unknown;
    try {
        parsed = JSON.parse(json);
    } catch (err) {
        throw new EvaluatorParseError(
            `JSON parse 실패: ${err instanceof Error ? err.message : String(err)}`,
            json,
        );
    }

    if (!isScanPayload(parsed)) {
        throw new EvaluatorParseError('ScanPayload schema mismatch.', json);
    }

    return parsed;
}

function extractJsonObject(text: string): string | null {
    const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
    const candidate = (fenced ? fenced[1] : text).trim();

    const start = candidate.indexOf('{');
    const end = candidate.lastIndexOf('}');
    if (start === -1 || end === -1 || end <= start) return null;
    return candidate.slice(start, end + 1);
}

function isScanPayload(value: unknown): value is ScanPayload {
    if (!value || typeof value !== 'object') return false;
    const v = value as Record<string, unknown>;
    return isEvaluateOutput(v.color) && isEvaluateOutput(v.typography);
}

function isEvaluateOutput(value: unknown): boolean {
    if (!value || typeof value !== 'object') return false;
    const v = value as Record<string, unknown>;
    return Array.isArray(v.violations) && Array.isArray(v.conformant);
}
