import { describe, expect, it } from 'vitest';

import { parseLlmResponse } from '~/ui/features/llm/parse';

describe('parseLlmResponse', () => {
    it('JSON text block 을 LlmJudgments 로 파싱한다', () => {
        const response = {
            content: [
                {
                    type: 'text' as const,
                    text: JSON.stringify({
                        typography: [
                            { nodeId: '1', name: 'h', token: 'subtitle1', verdict: 'PASS', confidence: 'HIGH', reasoning: '맞음', suggested: [] },
                        ],
                        semanticColor: [
                            { nodeId: '2', name: 'alert', property: 'fill', token: 'colors.background.danger.100', verdict: 'FAIL', confidence: 'MED', reasoning: '경고가 아닌 정보 자리', suggested: ['colors.background.hint.100'] },
                        ],
                    }),
                },
            ],
        };
        const result = parseLlmResponse(response);
        expect(result.typography[0].verdict).toBe('PASS');
        expect(result.semanticColor[0].suggested).toEqual(['colors.background.hint.100']);
    });

    it('마크다운 fence 감싸도 추출한다', () => {
        const response = {
            content: [
                {
                    type: 'text' as const,
                    text: '```json\n' + JSON.stringify({ typography: [], semanticColor: [] }) + '\n```',
                },
            ],
        };
        const result = parseLlmResponse(response);
        expect(result.typography).toEqual([]);
    });
});
