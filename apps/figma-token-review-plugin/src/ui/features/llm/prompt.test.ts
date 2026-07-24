import { describe, expect, it } from 'vitest';

import type { LlmInput } from '~/ui/lib/rubric';

import { buildRequest } from './prompt';

function baseInput(): LlmInput {
    return {
        context: { schemaMode: 'light', viewport: 'pc', totalRanks: 0 },
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
        input.context.totalRanks = 16;
        const req = buildRequest(input, '', 'claude-sonnet-4-6');
        const first = (req.messages[0]!.content as Array<{ type: string; text?: string }>)[0]!;
        const parsed = JSON.parse(first.text ?? '');
        expect(parsed.context.totalRanks).toBe(16);
        expect(Array.isArray(parsed.nodeTree)).toBe(true);
    });

    it('SYSTEM_BASE typography schema 블록에 axis 와 matchedRule 필드가 포함되고 verdict 는 제외된다', () => {
        const req = buildRequest(baseInput(), '', 'claude-sonnet-4-6');
        const combined = req.system.map((b) => b.text).join('\n');
        expect(combined).toContain('"axis"');
        expect(combined).toContain('"matchedRule"');
        expect(combined).toContain('"hierarchy"');
        expect(combined).toContain('"role"');
        // viewport 축은 결정론이 담당 → LLM 스키마에서 제외
        expect(combined).not.toContain('"viewport"');
        // FAIL 만 emit — verdict 필드 자체 제외
        expect(combined).not.toContain('"verdict"');
    });

    it('SEMANTIC_GUIDE 는 hierarchy/role 두 축 정의와 rubric 활용 지시를 포함한다', () => {
        const req = buildRequest(baseInput(), '', 'claude-sonnet-4-6');
        const combined = req.system.map((b) => b.text).join('\n');
        expect(combined).toContain('hierarchy');
        expect(combined).toContain('role');
        expect(combined).toContain('rubric.textStyle');
        expect(combined).toContain('matchedRule');
    });
});
