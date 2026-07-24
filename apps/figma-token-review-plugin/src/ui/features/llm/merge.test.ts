import { describe, expect, it } from 'vitest';

import type { MergeArgs, TargetLookup } from '~/ui/features/llm/merge';
import { mergeScanPayload } from '~/ui/features/llm/merge';
import type { LlmTypoJudgment } from '~/ui/features/llm/parse';
import { loadTextStyleSchema } from '~/ui/lib/loaders/typography';
import type { ColorTarget, TypographyTarget } from '~/ui/lib/rubric';

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

function makeTargets(overrides: Partial<TargetLookup> = {}): TargetLookup {
    return {
        typography: overrides.typography ?? new Map<string, TypographyTarget>(),
        color: overrides.color ?? new Map<string, ColorTarget>(),
        nameByNodeId: overrides.nameByNodeId ?? new Map<string, string>(),
    };
}

describe('mergeScanPayload', () => {
    it('nodeIds 로 묶인 conformant 는 노드별로 펼치고 LLM FAIL 노드만 제거된다', () => {
        const payload = mergeScanPayload({
            deterministic: {
                color: {
                    violations: [],
                    conformant: [
                        {
                            nodeId: 'A',
                            nodeIds: ['A', 'B', 'C'],
                            name: 'title',
                            property: 'fill-on-text',
                            token: 'color-foreground-normal-100',
                        },
                    ],
                    total: 3,
                },
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
                        nodeId: 'B',
                        property: 'fill-on-text',
                        confidence: 'HIGH',
                        reasoning: '위계 부적합',
                        suggested: [],
                    },
                ],
            },
            schemaMode: 'light',
            textStyleSchema: loadTextStyleSchema(),
            targets: makeTargets({
                color: new Map([
                    [
                        'B:fill-on-text',
                        {
                            nodeId: 'B',
                            property: 'fill-on-text',
                            token: 'color-foreground-normal-100',
                        },
                    ],
                ]),
                nameByNodeId: new Map([['B', 'title']]),
            }),
        });
        const remainingIds = payload.color.conformant.map((c) => c.nodeId).sort();
        expect(remainingIds).toEqual(['A', 'C']);
        expect(payload.color.violations[0].nodeId).toBe('B');
        expect(payload.color.violations[0].token).toBe('color-foreground-normal-100');
        expect(payload.color.violations[0].name).toBe('title');
    });

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
                        property: 'fill',
                        confidence: 'MED',
                        reasoning: '경고 아님',
                        suggested: [],
                    },
                ],
            },
            schemaMode: 'light',
            textStyleSchema: loadTextStyleSchema(),
            targets: makeTargets({
                typography: new Map([['1', { nodeId: '1', textStyle: 'body2' }]]),
                color: new Map([
                    [
                        '2:fill',
                        { nodeId: '2', property: 'fill', token: 'color-background-danger-100' },
                    ],
                ]),
                nameByNodeId: new Map([
                    ['1', 'h'],
                    ['2', 'alert'],
                ]),
            }),
        });
        expect(payload.typography.violations[0].origin).toBe('llm');
        expect(payload.typography.violations[0].severity).toBe('high');
        expect(payload.typography.violations[0].token).toBe('body2');
        expect(payload.color.violations[0].origin).toBe('llm');
        expect(payload.color.violations[0].token).toBe('color-background-danger-100');
    });

    it('적합률은 severity=high 전체를 부적합으로 셈, confidence 는 별도 축', () => {
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
                        property: 'fill',
                        confidence: 'HIGH',
                        reasoning: '',
                        suggested: [],
                    },
                    {
                        nodeId: '2',
                        property: 'fill',
                        confidence: 'LOW',
                        reasoning: '',
                        suggested: [],
                    },
                ],
            },
            schemaMode: 'light',
            textStyleSchema: loadTextStyleSchema(),
            targets: makeTargets({
                color: new Map([
                    [
                        '1:fill',
                        { nodeId: '1', property: 'fill', token: 'color-background-primary-100' },
                    ],
                    [
                        '2:fill',
                        { nodeId: '2', property: 'fill', token: 'color-background-primary-100' },
                    ],
                ]),
                // 서로 다른 name → 그룹화되지 않고 2개 카드 유지
                nameByNodeId: new Map([
                    ['1', 'a'],
                    ['2', 'b'],
                ]),
            }),
        });
        expect(payload.color.summary.conformanceRate).toBeCloseTo(0.8);
        expect(payload.color.summary.highViolations).toBe(2);
        expect(payload.color.summary.heuristicViolations).toBe(2);
        expect(payload.color.summary.lowConfidenceCount).toBe(1);
    });

    it('targets 에 없는 nodeId 의 LLM 판정은 조용히 드롭한다', () => {
        const payload = mergeScanPayload({
            deterministic: emptyDeterministic(),
            llm: {
                typography: [
                    {
                        nodeId: 'ghost',
                        confidence: 'HIGH',
                        axis: 'hierarchy',
                        matchedRule: '',
                        reasoning: '없는 노드',
                        suggested: [],
                    },
                ],
                semanticColor: [],
            },
            schemaMode: 'light',
            textStyleSchema: loadTextStyleSchema(),
            targets: makeTargets(),
        });
        expect(payload.typography.violations).toHaveLength(0);
    });
});

const textStyleSchema = loadTextStyleSchema();

function makeTypoJudgment(overrides: Partial<LlmTypoJudgment> = {}): LlmTypoJudgment {
    return {
        nodeId: 'n1',
        confidence: 'HIGH',
        axis: 'hierarchy',
        matchedRule: '본문에 heading 오용',
        reasoning: '이유',
        suggested: ['body1'],
        ...overrides,
    };
}

function mergeWithTypo(
    judgment: LlmTypoJudgment,
    typoTarget: TypographyTarget = { nodeId: 'n1', textStyle: 'body2' },
) {
    return mergeScanPayload({
        deterministic: emptyDeterministic(),
        llm: { typography: [judgment], semanticColor: [] },
        schemaMode: 'light',
        textStyleSchema,
        targets: makeTargets({
            typography: new Map([[typoTarget.nodeId, typoTarget]]),
            nameByNodeId: new Map([[typoTarget.nodeId, 'Label']]),
        }),
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

    it('reasoning 이 "PASS 로 재판단" 을 포함하면 emit 하지 않는다', () => {
        const payload = mergeWithTypo(
            makeTypoJudgment({
                reasoning:
                    'subtitle2의 when에 부합하므로 이 자리는 적절하다. PASS로 재판단. emit 불필요.',
            }),
        );
        expect(payload.typography.violations).toHaveLength(0);
    });

    it('reasoning 이 "emit 불필요" 만 포함해도 드롭한다', () => {
        const payload = mergeWithTypo(makeTypoJudgment({ reasoning: '적절 — emit 불필요' }));
        expect(payload.typography.violations).toHaveLength(0);
    });
});

describe('LLM violation grouping', () => {
    it('같은 (name, type, property, token) 조합의 여러 nodeId FAIL 은 한 카드로 묶인다', () => {
        const payload = mergeScanPayload({
            deterministic: emptyDeterministic(),
            llm: {
                typography: [
                    {
                        nodeId: 'n1',
                        confidence: 'MED',
                        axis: 'role',
                        matchedRule: 'rank/sub',
                        reasoning: 'a',
                        suggested: ['subtitle1'],
                    },
                    {
                        nodeId: 'n2',
                        confidence: 'HIGH',
                        axis: 'role',
                        matchedRule: 'rank/sub',
                        reasoning: 'b',
                        suggested: ['subtitle1', 'heading4'],
                    },
                    {
                        nodeId: 'n3',
                        confidence: 'LOW',
                        axis: 'role',
                        matchedRule: 'rank/sub',
                        reasoning: 'c',
                        suggested: [],
                    },
                ],
                semanticColor: [],
            },
            schemaMode: 'light',
            textStyleSchema,
            targets: makeTargets({
                typography: new Map([
                    ['n1', { nodeId: 'n1', textStyle: 'subtitle2' }],
                    ['n2', { nodeId: 'n2', textStyle: 'subtitle2' }],
                    ['n3', { nodeId: 'n3', textStyle: 'subtitle2' }],
                ]),
                nameByNodeId: new Map([
                    ['n1', 'BADGE'],
                    ['n2', 'BADGE'],
                    ['n3', 'BADGE'],
                ]),
            }),
        });
        expect(payload.typography.violations).toHaveLength(1);
        const v = payload.typography.violations[0];
        expect(v.nodeIds).toEqual(['n1', 'n2', 'n3']);
        expect(v.count).toBe(3);
        // 최고 confidence(HIGH) 판정의 message 를 대표로 사용
        expect(v.confidence).toBe('HIGH');
        expect(v.message).toBe('[rank/sub] b');
        // suggested 는 union, 순서 보존
        expect(v.suggested).toEqual(['subtitle1', 'heading4']);
    });

    it('그룹된 LLM FAIL 의 모든 nodeId 는 conformant 에서 제외된다', () => {
        const payload = mergeScanPayload({
            deterministic: {
                color: {
                    violations: [],
                    conformant: [
                        {
                            nodeId: 'A',
                            nodeIds: ['A', 'B', 'C', 'D'],
                            name: 'BADGE',
                            property: 'fill-on-text',
                            token: 'color-foreground-normal-100',
                        },
                    ],
                    total: 4,
                },
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
                        nodeId: 'B',
                        property: 'fill-on-text',
                        confidence: 'HIGH',
                        reasoning: '경고 아님',
                        suggested: [],
                    },
                    {
                        nodeId: 'C',
                        property: 'fill-on-text',
                        confidence: 'HIGH',
                        reasoning: '경고 아님',
                        suggested: [],
                    },
                ],
            },
            schemaMode: 'light',
            textStyleSchema,
            targets: makeTargets({
                color: new Map([
                    [
                        'B:fill-on-text',
                        {
                            nodeId: 'B',
                            property: 'fill-on-text',
                            token: 'color-foreground-normal-100',
                        },
                    ],
                    [
                        'C:fill-on-text',
                        {
                            nodeId: 'C',
                            property: 'fill-on-text',
                            token: 'color-foreground-normal-100',
                        },
                    ],
                ]),
                nameByNodeId: new Map([
                    ['B', 'BADGE'],
                    ['C', 'BADGE'],
                ]),
            }),
        });
        expect(payload.color.violations).toHaveLength(1);
        expect(payload.color.violations[0].nodeIds).toEqual(['B', 'C']);
        const remaining = payload.color.conformant.map((c) => c.nodeId).sort();
        expect(remaining).toEqual(['A', 'D']);
    });
});
