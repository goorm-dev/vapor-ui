import { describe, expect, it } from 'vitest';

import type { MergeArgs } from '~/ui/features/llm/merge';
import { mergeScanPayload } from '~/ui/features/llm/merge';
import type { LlmTypoJudgment } from '~/ui/features/llm/parse';
import { loadTextStyleSchema } from '~/ui/lib/loaders/typography';

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
                        axis: 'hierarchy',
                        matchedRule: '',
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
            textStyleSchema: loadTextStyleSchema(),
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
            textStyleSchema: loadTextStyleSchema(),
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
                        axis: 'hierarchy',
                        matchedRule: '',
                        reasoning: '',
                        suggested: [],
                    },
                ],
                semanticColor: [],
            },
            schemaMode: 'light',
            textStyleSchema: loadTextStyleSchema(),
        });
        expect(payload.typography.violations.length).toBe(0);
        expect(payload.typography.conformant.length).toBe(0); // 결정론 conformant 입력 없음
    });
});

const textStyleSchema = loadTextStyleSchema();

function makeTypoJudgment(overrides: Partial<LlmTypoJudgment> = {}) {
    return {
        nodeId: 'n1',
        name: 'Label',
        token: 'body2',
        verdict: 'FAIL' as const,
        confidence: 'HIGH' as const,
        axis: 'hierarchy' as const,
        matchedRule: '본문에 heading 오용',
        reasoning: '이유',
        suggested: ['body1'],
        ...overrides,
    };
}

function emptyDeterministic(): MergeArgs['deterministic'] {
    const empty = () => ({ violations: [], conformant: [], total: 0 });
    return {
        color: empty(),
        space: empty(),
        dimension: empty(),
        typography: empty(),
        borderRadius: empty(),
        shadow: empty(),
    };
}

function mergeWithTypo(judgment: LlmTypoJudgment) {
    return mergeScanPayload({
        deterministic: emptyDeterministic(),
        llm: { typography: [judgment], semanticColor: [] },
        schemaMode: 'light',
        textStyleSchema,
    });
}

describe('heuristicTypo axis mapping / message / filter', () => {
    it('axis=hierarchy → violation.type=typo-hierarchy', () => {
        const payload = mergeWithTypo(makeTypoJudgment({ axis: 'hierarchy' }));
        expect(payload.typography.violations[0].type).toBe('typo-hierarchy');
    });

    it('axis=role → violation.type=typo-role-misfit', () => {
        const payload = mergeWithTypo(makeTypoJudgment({ axis: 'role' }));
        expect(payload.typography.violations[0].type).toBe('typo-role-misfit');
    });

    it('axis=viewport → violation.type=typo-viewport-misfit', () => {
        const payload = mergeWithTypo(makeTypoJudgment({ axis: 'viewport' }));
        expect(payload.typography.violations[0].type).toBe('typo-viewport-misfit');
    });

    it('matchedRule 이 있으면 message 앞에 대괄호로 붙는다', () => {
        const payload = mergeWithTypo(
            makeTypoJudgment({ matchedRule: 'mobile → heading1', reasoning: '모바일임' }),
        );
        expect(payload.typography.violations[0].message).toBe('[mobile → heading1] 모바일임');
    });

    it('matchedRule 이 빈 문자열이면 reasoning 만 사용', () => {
        const payload = mergeWithTypo(makeTypoJudgment({ matchedRule: '', reasoning: '이유만' }));
        expect(payload.typography.violations[0].message).toBe('이유만');
    });

    it('suggested 는 스키마에 없는 이름을 걸러낸다', () => {
        const payload = mergeWithTypo(
            makeTypoJudgment({ suggested: ['body1', 'nonexistent-style', 'subtitle1'] }),
        );
        expect(payload.typography.violations[0].suggested).toEqual(['body1', 'subtitle1']);
    });
});
