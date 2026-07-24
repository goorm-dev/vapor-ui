import { describe, expect, it } from 'vitest';

import { LlmParseError, parseLlmResponse } from '~/ui/features/llm/parse';

describe('parseLlmResponse', () => {
    it('JSON text block 을 LlmJudgments 로 파싱한다', () => {
        const response = {
            content: [
                {
                    type: 'text' as const,
                    text: JSON.stringify({
                        typography: [
                            {
                                nodeId: '1',
                                confidence: 'HIGH',
                                axis: 'hierarchy',
                                matchedRule: 'x',
                                reasoning: '위계 이탈',
                                suggested: ['heading4'],
                            },
                        ],
                        semanticColor: [
                            {
                                nodeId: '2',
                                property: 'fill',
                                confidence: 'MED',
                                reasoning: '경고가 아닌 정보 자리',
                                suggested: ['colors.background.hint.100'],
                            },
                        ],
                    }),
                },
            ],
        };
        const result = parseLlmResponse(response);
        expect(result.typography[0].axis).toBe('hierarchy');
        expect(result.semanticColor[0].suggested).toEqual(['colors.background.hint.100']);
    });

    it('마크다운 fence 감싸도 추출한다', () => {
        const response = {
            content: [
                {
                    type: 'text' as const,
                    text:
                        '```json\n' +
                        JSON.stringify({ typography: [], semanticColor: [] }) +
                        '\n```',
                },
            ],
        };
        const result = parseLlmResponse(response);
        expect(result.typography).toEqual([]);
    });

    it('typography 배열에 malformed item(null)이 있으면 LlmParseError를 던진다', () => {
        const response = {
            content: [
                {
                    type: 'text' as const,
                    text: JSON.stringify({
                        typography: [null],
                        semanticColor: [],
                    }),
                },
            ],
        };
        expect(() => parseLlmResponse(response)).toThrow(LlmParseError);
    });

    it('semanticColor 배열에 malformed item(숫자)이 있으면 LlmParseError를 던진다', () => {
        const response = {
            content: [
                {
                    type: 'text' as const,
                    text: JSON.stringify({
                        typography: [],
                        semanticColor: [42],
                    }),
                },
            ],
        };
        expect(() => parseLlmResponse(response)).toThrow(LlmParseError);
    });

    it('typography item 에 axis 필드가 없으면 LlmParseError', () => {
        const response = {
            content: [
                {
                    type: 'text' as const,
                    text: JSON.stringify({
                        typography: [
                            {
                                nodeId: '1',
                                confidence: 'HIGH',
                                matchedRule: '',
                                reasoning: '맞음',
                                suggested: [],
                            },
                        ],
                        semanticColor: [],
                    }),
                },
            ],
        };
        expect(() => parseLlmResponse(response)).toThrow(LlmParseError);
    });

    it('typography item 의 axis 가 2-value union 밖이면 LlmParseError', () => {
        const response = {
            content: [
                {
                    type: 'text' as const,
                    text: JSON.stringify({
                        typography: [
                            {
                                nodeId: '1',
                                confidence: 'MED',
                                axis: 'viewport',
                                matchedRule: 'x',
                                reasoning: 'nope',
                                suggested: [],
                            },
                        ],
                        semanticColor: [],
                    }),
                },
            ],
        };
        expect(() => parseLlmResponse(response)).toThrow(LlmParseError);
    });

    it('typography item 에 matchedRule 이 빈 문자열이면 통과한다', () => {
        const response = {
            content: [
                {
                    type: 'text' as const,
                    text: JSON.stringify({
                        typography: [
                            {
                                nodeId: '1',
                                confidence: 'HIGH',
                                axis: 'role',
                                matchedRule: '',
                                reasoning: '맞음',
                                suggested: [],
                            },
                        ],
                        semanticColor: [],
                    }),
                },
            ],
        };
        const result = parseLlmResponse(response);
        expect(result.typography[0].axis).toBe('role');
        expect(result.typography[0].matchedRule).toBe('');
    });

    it('semanticColor item에 property 필드가 없으면 LlmParseError를 던진다', () => {
        const response = {
            content: [
                {
                    type: 'text' as const,
                    text: JSON.stringify({
                        typography: [],
                        semanticColor: [
                            {
                                nodeId: '1',
                                confidence: 'HIGH',
                                reasoning: 'ok',
                                suggested: [],
                            },
                        ],
                    }),
                },
            ],
        };
        expect(() => parseLlmResponse(response)).toThrow(LlmParseError);
    });
});
