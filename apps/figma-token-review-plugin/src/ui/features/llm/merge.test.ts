import { describe, expect, it } from 'vitest';

import { mergeScanPayload } from '~/ui/features/llm/merge';

describe('mergeScanPayload', () => {
    it('LLM heuristic FAIL 항목을 해당 카테고리 violations 로 합친다', () => {
        const payload = mergeScanPayload({
            deterministic: {
                color: { violations: [], conformant: [], total: 1 },
                space: { violations: [], conformant: [], total: 0 },
                dimension: { violations: [], conformant: [], total: 0 },
                typography: { violations: [], conformant: [], total: 1 },
                borderRadius: { violations: [], conformant: [], total: 0 },
                shadow: { violations: [], conformant: [], total: 0 },
            },
            llm: {
                typography: [
                    {
                        nodeId: '1',
                        name: 'h',
                        token: 'body2',
                        verdict: 'FAIL',
                        confidence: 'HIGH',
                        reasoning: '제목 자리에 본문',
                        suggested: ['heading4'],
                    },
                ],
                semanticColor: [
                    {
                        nodeId: '2',
                        name: 'alert',
                        property: 'fill',
                        token: 'color-background-danger-100',
                        verdict: 'FAIL',
                        confidence: 'MED',
                        reasoning: '경고 아님',
                        suggested: [],
                    },
                ],
            },
            schemaMode: 'light',
        });
        expect(payload.typography.violations[0].origin).toBe('llm');
        expect(payload.typography.violations[0].severity).toBe('high');
        expect(payload.color.violations[0].origin).toBe('llm');
    });

    it('적합률은 결정론 high + HIGH-confidence heuristic 만 부적합', () => {
        const payload = mergeScanPayload({
            deterministic: {
                color: { violations: [], conformant: [], total: 10 },
                space: { violations: [], conformant: [], total: 0 },
                dimension: { violations: [], conformant: [], total: 0 },
                typography: { violations: [], conformant: [], total: 0 },
                borderRadius: { violations: [], conformant: [], total: 0 },
                shadow: { violations: [], conformant: [], total: 0 },
            },
            llm: {
                typography: [],
                semanticColor: [
                    {
                        nodeId: '1',
                        name: 'a',
                        property: 'fill',
                        token: 'color-background-primary-100',
                        verdict: 'FAIL',
                        confidence: 'HIGH',
                        reasoning: '',
                        suggested: [],
                    },
                    {
                        nodeId: '2',
                        name: 'b',
                        property: 'fill',
                        token: 'color-background-primary-100',
                        verdict: 'FAIL',
                        confidence: 'LOW',
                        reasoning: '',
                        suggested: [],
                    },
                ],
            },
            schemaMode: 'light',
        });
        // 부적합 1건(HIGH), 비결정 1건(LOW). 적합률 = (10-1)/10 = 0.9
        expect(payload.color.summary.conformanceRate).toBeCloseTo(0.9);
    });

    it('verdict=PASS 인 heuristic 은 어디에도 기록하지 않는다', () => {
        const payload = mergeScanPayload({
            deterministic: {
                color: { violations: [], conformant: [], total: 1 },
                space: { violations: [], conformant: [], total: 0 },
                dimension: { violations: [], conformant: [], total: 0 },
                typography: { violations: [], conformant: [], total: 1 },
                borderRadius: { violations: [], conformant: [], total: 0 },
                shadow: { violations: [], conformant: [], total: 0 },
            },
            llm: {
                typography: [
                    {
                        nodeId: '1',
                        name: 'h',
                        token: 'body2',
                        verdict: 'PASS',
                        confidence: 'HIGH',
                        reasoning: '',
                        suggested: [],
                    },
                ],
                semanticColor: [],
            },
            schemaMode: 'light',
        });
        expect(payload.typography.violations.length).toBe(0);
        expect(payload.typography.conformant.length).toBe(0); // 결정론 conformant 입력 없음
    });
});
