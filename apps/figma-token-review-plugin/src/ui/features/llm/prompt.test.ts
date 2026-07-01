import { describe, expect, it } from 'vitest';

import type { LlmInput } from '~/ui/lib/rubric';

import { buildRequest } from './prompt';

function baseInput(): LlmInput {
    return {
        context: { schemaMode: 'light', viewport: 'pc', frameName: 'F' },
        judgmentTargets: { typography: [], semanticColor: [] },
        rubric: { textStyle: {}, color: {} },
        nodeTree: [],
    };
}

describe('buildRequest', () => {
    it('with a non-empty screenshot, emits [text, image] content blocks', () => {
        const req = buildRequest(baseInput(), 'AAAA', 'claude-sonnet-4-6');
        expect(req.messages).toHaveLength(1);
        const content = req.messages[0]!.content as Array<{ type: string }>;
        expect(content).toHaveLength(2);
        expect(content[0]).toMatchObject({ type: 'text' });
        expect(content[1]).toMatchObject({
            type: 'image',
            source: { type: 'base64', media_type: 'image/png', data: 'AAAA' },
        });
    });

    it('with empty screenshot, emits [text] only', () => {
        const req = buildRequest(baseInput(), '', 'claude-sonnet-4-6');
        const content = req.messages[0]!.content as Array<{ type: string }>;
        expect(content).toHaveLength(1);
        expect(content[0]).toMatchObject({ type: 'text' });
    });

    it('serializes the input into the text block as JSON', () => {
        const input = baseInput();
        input.context.frameName = 'MyFrame';
        const req = buildRequest(input, '', 'claude-sonnet-4-6');
        const first = (req.messages[0]!.content as Array<{ type: string; text?: string }>)[0]!;
        const parsed = JSON.parse(first.text ?? '');
        expect(parsed.context.frameName).toBe('MyFrame');
        expect(Array.isArray(parsed.nodeTree)).toBe(true);
    });
});
