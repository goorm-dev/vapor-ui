import type { Confidence } from '~/common/schemas';

type AnthropicTextBlock = { type: 'text'; text: string };
type AnthropicContentBlock = AnthropicTextBlock | { type: string; [k: string]: unknown };

export type AnthropicMessagesResponse = {
    content?: AnthropicContentBlock[];
};

export type LlmTypoJudgment = {
    nodeId: string;
    name: string;
    token: string;
    verdict: 'PASS' | 'FAIL';
    confidence: Confidence;
    axis: 'hierarchy' | 'role' | 'viewport';
    matchedRule: string;
    reasoning: string;
    suggested: string[];
};

export type LlmColorJudgment = {
    nodeId: string;
    name: string;
    property: 'fill' | 'fill-on-text' | 'stroke';
    token: string;
    verdict: 'PASS' | 'FAIL';
    confidence: Confidence;
    reasoning: string;
    suggested: string[];
};

export type LlmJudgments = {
    typography: LlmTypoJudgment[];
    semanticColor: LlmColorJudgment[];
};

export class LlmParseError extends Error {
    readonly raw: string | null;
    constructor(message: string, raw: string | null) {
        super(message);
        this.name = 'LlmParseError';
        this.raw = raw;
    }
}

function extractJsonObject(text: string): string | null {
    const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
    const candidate = (fenced ? fenced[1] : text).trim();
    const start = candidate.indexOf('{');
    const end = candidate.lastIndexOf('}');
    if (start === -1 || end === -1 || end <= start) return null;
    return candidate.slice(start, end + 1);
}

function isTypoJudgment(v: unknown): v is LlmTypoJudgment {
    if (!v || typeof v !== 'object') return false;
    const o = v as Record<string, unknown>;
    return (
        typeof o.nodeId === 'string' &&
        typeof o.name === 'string' &&
        typeof o.token === 'string' &&
        (o.verdict === 'PASS' || o.verdict === 'FAIL') &&
        (o.confidence === 'HIGH' || o.confidence === 'MED' || o.confidence === 'LOW') &&
        (o.axis === 'hierarchy' || o.axis === 'role' || o.axis === 'viewport') &&
        typeof o.matchedRule === 'string' &&
        typeof o.reasoning === 'string' &&
        Array.isArray(o.suggested)
    );
}

function isColorJudgment(v: unknown): v is LlmColorJudgment {
    if (!v || typeof v !== 'object') return false;
    const o = v as Record<string, unknown>;
    return (
        typeof o.nodeId === 'string' &&
        typeof o.name === 'string' &&
        typeof o.token === 'string' &&
        (o.property === 'fill' || o.property === 'fill-on-text' || o.property === 'stroke') &&
        (o.verdict === 'PASS' || o.verdict === 'FAIL') &&
        (o.confidence === 'HIGH' || o.confidence === 'MED' || o.confidence === 'LOW') &&
        typeof o.reasoning === 'string' &&
        Array.isArray(o.suggested)
    );
}

function isJudgments(value: unknown): value is LlmJudgments {
    if (!value || typeof value !== 'object') return false;
    const v = value as Record<string, unknown>;
    return (
        Array.isArray(v.typography) &&
        v.typography.every(isTypoJudgment) &&
        Array.isArray(v.semanticColor) &&
        v.semanticColor.every(isColorJudgment)
    );
}

export function parseLlmResponse(response: AnthropicMessagesResponse): LlmJudgments {
    const blocks = response.content ?? [];
    const lastText = [...blocks]
        .reverse()
        .find(
            (b): b is AnthropicTextBlock =>
                b.type === 'text' && typeof (b as AnthropicTextBlock).text === 'string',
        );
    if (!lastText) throw new LlmParseError('LLM 응답에 text block이 없습니다.', null);
    const json = extractJsonObject(lastText.text);
    if (!json) throw new LlmParseError('LLM 응답에서 JSON 객체를 찾을 수 없습니다.', lastText.text);
    let parsed: unknown;
    try {
        parsed = JSON.parse(json);
    } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        throw new LlmParseError(`JSON parse 실패: ${msg}`, json);
    }
    if (!isJudgments(parsed)) throw new LlmParseError('LlmJudgments schema mismatch.', json);
    return parsed;
}
