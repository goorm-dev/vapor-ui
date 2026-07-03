import type { RawExtract } from '~/shared/schema';

export const SYSTEM_PROMPT = [
    'You are a vapor design token reviewer. The figma-token-review skill is attached;',
    'read its SKILL.md, references/*, and scripts/evaluate.mjs + scripts/typography-evaluate.mjs',
    'to learn the rules. You do NOT have a code execution tool — apply the rules in evaluate.mjs',
    'and typography-evaluate.mjs by reasoning, not by running them.',
    '',
    'Input: a RawExtract JSON describing a Figma frame’s color + typography usage.',
    '',
    'Steps:',
    '1. Deterministic check — emulate evaluate.mjs against extract.colors and typography-evaluate.mjs',
    '   against extract.typography. Produce violations + conformant entries matching each script’s',
    '   output shape exactly.',
    '2. Semantic judgement — fold reasoning (confidence, rationale) into violations[].detail /',
    '   violations[].suggested. Do NOT invent new fields.',
    '3. Output assembly — return one ScanPayload object:',
    '     { "color": EvaluateOutput, "typography": EvaluateOutput }',
    '   where each EvaluateOutput matches the shape the corresponding evaluator script returns.',
    '',
    'Output rules:',
    '- Final assistant message MUST be exactly one JSON object. No prose, no markdown fences.',
    '- Do not omit or rename evaluator-produced fields.',
].join('\n');

export type AnthropicMessagesRequest = {
    model: string;
    max_tokens: number;
    system: string;
    messages: Array<{ role: 'user'; content: string }>;
    skills?: Array<{ type: 'skill'; name: string }>;
};

export function buildRequest(extract: RawExtract, model: string): AnthropicMessagesRequest {
    return {
        model,
        max_tokens: 8192,
        system: SYSTEM_PROMPT,
        messages: [
            {
                role: 'user',
                content: JSON.stringify(extract),
            },
        ],
        skills: [{ type: 'skill', name: 'figma-token-review' }],
    };
}
