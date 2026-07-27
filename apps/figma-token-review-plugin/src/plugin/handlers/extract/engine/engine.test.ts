import { describe, expect, it, vi } from 'vitest';

import { passes, runRules } from './engine';
import type { AnyExtractionRule, ExtractCtx } from './types';

const node = { id: 'n1', name: 'Card' } as SceneNode;

const ctx = (over: Partial<ExtractCtx> = {}): ExtractCtx => ({
    rootId: 'root',
    viewport: 'pc',
    boundVariables: undefined,
    filter: null,
    ...over,
});

/** 테스트용 최소 spaces 규칙. */
const spaceRule = (over: Partial<AnyExtractionRule> = {}): AnyExtractionRule =>
    ({
        name: 'test:space',
        category: 'spaces',
        filterKeys: ['itemSpacing'],
        extract: async () => [
            { property: 'gap', value: '8px', token: 'space-100', appliedToken: null, tokenStatus: 'ok' },
        ],
        ...over,
    }) as AnyExtractionRule;

describe('passes', () => {
    it('null 필터는 전부 통과', () => {
        expect(passes(null, 'anything')).toBe(true);
    });
    it('키 하나라도 포함 시 통과, 아니면 차단', () => {
        expect(passes(new Set(['fills']), 'fills', 'strokes')).toBe(true);
        expect(passes(new Set(['fills']), 'strokes')).toBe(false);
    });
});

describe('runRules', () => {
    it('emission 에 nodeId/name 스탬핑 후 category 로 병합', async () => {
        const { facts } = await runRules(node, ctx(), [spaceRule()]);
        expect(facts.spaces).toEqual([
            {
                nodeId: 'n1',
                name: 'Card',
                property: 'gap',
                value: '8px',
                token: 'space-100',
                appliedToken: null,
                tokenStatus: 'ok',
            },
        ]);
        expect(facts.colors).toEqual([]);
    });

    it('filterKeys 미충족 규칙은 extract 미호출 스킵', async () => {
        let called = false;
        const rule = spaceRule({
            extract: async () => {
                called = true;
                return [];
            },
        });
        const { facts, trace } = await runRules(node, ctx({ filter: new Set(['fills']) }), [rule], {
            trace: true,
        });
        expect(called).toBe(false);
        expect(facts.spaces).toEqual([]);
        expect(trace).toContainEqual({ rule: 'test:space', skipped: 'filter' });
    });

    it('가드 실패 시 가드명이 trace 에 남는다', async () => {
        const rule = spaceRule({
            guards: [{ name: 'never', test: () => false }],
        });
        const { trace } = await runRules(node, ctx(), [rule], { trace: true });
        expect(trace).toContainEqual({ rule: 'test:space', skipped: 'guard:never' });
    });

    it('한 규칙의 throw 가 다른 규칙 결과를 죽이지 않는다', async () => {
        const bad = spaceRule({
            name: 'test:bad',
            extract: async () => {
                throw new Error('boom');
            },
        });
        const { facts, trace } = await runRules(node, ctx(), [bad, spaceRule()], { trace: true });
        expect(facts.spaces).toHaveLength(1);
        expect(trace).toContainEqual({ rule: 'test:bad', error: 'boom' });
    });

    it('병합 순서는 테이블 순서를 따른다 (완료 순서 무관)', async () => {
        const slow = spaceRule({
            name: 'test:slow',
            extract: async () => {
                await new Promise((r) => setTimeout(r, 20));
                return [{ property: 'gap', value: '1px', token: null, appliedToken: null, tokenStatus: 'raw' }];
            },
        });
        const fast = spaceRule({
            name: 'test:fast',
            extract: async () => [
                { property: 'gap', value: '2px', token: null, appliedToken: null, tokenStatus: 'raw' },
            ],
        });
        const { facts } = await runRules(node, ctx(), [slow, fast]);
        expect(facts.spaces.map((s) => s.value)).toEqual(['1px', '2px']);
    });

    it('trace 옵션 없으면 trace 는 빈 배열', async () => {
        const { trace } = await runRules(node, ctx(), [spaceRule()]);
        expect(trace).toEqual([]);
    });

    it('trace off + throwing rule → console.warn 호출, 다른 규칙 결과는 유지', async () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const bad = spaceRule({
            name: 'test:bad',
            extract: async () => {
                throw new Error('silent-boom');
            },
        });
        const { facts } = await runRules(node, ctx(), [bad, spaceRule()]);
        expect(warnSpy).toHaveBeenCalledOnce();
        expect(warnSpy.mock.calls[0][0]).toContain('[extract] rule "test:bad" failed on node n1:');
        expect(facts.spaces).toHaveLength(1);
        warnSpy.mockRestore();
    });
});
