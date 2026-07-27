/* eslint-disable @typescript-eslint/no-explicit-any */
import { afterEach, describe, expect, it } from 'vitest';

import { composite, px, tokenField } from './factories';
import type { ExtractCtx } from './types';

const ctx = (over: Partial<ExtractCtx> = {}): ExtractCtx => ({
    rootId: 'root',
    viewport: 'pc',
    boundVariables: undefined,
    filter: null,
    ...over,
});

describe('tokenField', () => {
    const gap = tokenField({
        name: 'space:gap',
        category: 'spaces',
        property: 'gap',
        field: 'itemSpacing',
    });

    afterEach(() => {
        delete (globalThis as any).figma;
    });

    it('filterKeys 는 field 하나', () => {
        expect(gap.filterKeys).toEqual(['itemSpacing']);
    });

    it('숫자 필드 → px 포맷 + raw 상태 emission (바인딩 없음)', async () => {
        const node = { id: 'n', name: 'N', itemSpacing: 8 } as unknown as SceneNode;
        const out = await gap.extract(node, ctx());
        expect(out).toEqual([
            { property: 'gap', value: '8px', token: null, appliedToken: null, tokenStatus: 'raw' },
        ]);
    });

    it('필드가 숫자가 아니면 미방출 (figma.mixed, undefined)', async () => {
        const node = { id: 'n', name: 'N', itemSpacing: Symbol('mixed') } as unknown as SceneNode;
        expect(await gap.extract(node, ctx())).toEqual([]);
        expect(await gap.extract({ id: 'n', name: 'N' } as SceneNode, ctx())).toEqual([]);
    });

    it('boundVariables 에 바인딩이 있으면 readBoundToken 경로로 토큰 해석', async () => {
        // walk() 가 semantic tier 를 찾도록 figma variable API 를 mock.
        // variables.ts:43 getVariableWithRemoteDefense → figma.variables.getVariableByIdAsync
        // variables.ts:83 walk → figma.variables.getVariableCollectionByIdAsync
        (globalThis as { figma?: unknown }).figma = {
            variables: {
                getVariableByIdAsync: async () => ({
                    name: 'space-100',
                    remote: false,
                    variableCollectionId: 'c1',
                    valuesByMode: { m1: 8 },
                }),
                getVariableCollectionByIdAsync: async () => ({ name: '● token', modes: [] }),
            },
        };
        const node = { id: 'n', name: 'N', itemSpacing: 8 } as unknown as SceneNode;
        const out = await gap.extract(node, ctx({ boundVariables: { itemSpacing: { id: 'v1' } } }));
        expect(out[0]?.tokenStatus).toBe('ok');
        expect(out[0]?.token).toBe('space-100');
    });
});

describe('composite', () => {
    it('선언 필드를 그대로 규칙으로 조립', async () => {
        const rule = composite({
            name: 'shadow',
            category: 'shadows',
            filterKeys: ['effects'],
            read: async () => [{ value: 'css', token: null, tokenStatus: 'raw' as const }],
        });
        expect(rule.name).toBe('shadow');
        expect(rule.filterKeys).toEqual(['effects']);
        const out = await rule.extract({} as SceneNode, ctx());
        expect(out).toEqual([{ value: 'css', token: null, tokenStatus: 'raw' }]);
    });
});

describe('px', () => {
    it('숫자를 px 문자열로', () => {
        expect(px(12)).toBe('12px');
    });
});
