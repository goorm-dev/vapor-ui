import { describe, expect, it } from 'vitest';

import type { ExtractCtx } from '../engine/types';
import { heightRule, widthRule } from './dimension';

const ctx = (over: Partial<ExtractCtx> = {}): ExtractCtx => ({
    rootId: 'root',
    viewport: 'pc',
    boundVariables: undefined,
    filter: null,
    ...over,
});

describe('dimension rules', () => {
    it('widthRule: FIXED 노드 width emission', async () => {
        const node = {
            id: 'n',
            name: 'Box',
            type: 'FRAME',
            width: 320,
            layoutSizingHorizontal: 'FIXED',
        } as unknown as SceneNode;
        // 가드 통과 검증 후 extract
        expect(widthRule.guards?.every((g) => g.test(node, ctx()))).toBe(true);
        const out = await widthRule.extract(node, ctx());
        expect(out).toEqual([
            { property: 'width', value: '320px', token: null, appliedToken: null, tokenStatus: 'raw' },
        ]);
    });

    it('widthRule 가드: 벡터/root/HUG 차단', () => {
        const base = { id: 'n', name: 'B', type: 'FRAME', layoutSizingHorizontal: 'FIXED' };
        const vector = { ...base, type: 'VECTOR' } as unknown as SceneNode;
        const root = { ...base, id: 'root' } as unknown as SceneNode;
        const hug = { ...base, layoutSizingHorizontal: 'HUG' } as unknown as SceneNode;

        const pass = (n: SceneNode) => widthRule.guards?.every((g) => g.test(n, ctx()));
        expect(pass(vector)).toBe(false);
        expect(pass(root)).toBe(false);
        expect(pass(hug)).toBe(false);
    });

    it('heightRule 은 layoutSizingVertical 기준', () => {
        const node = {
            id: 'n',
            name: 'B',
            type: 'FRAME',
            layoutSizingVertical: 'FIXED',
        } as unknown as SceneNode;
        expect(heightRule.guards?.every((g) => g.test(node, ctx()))).toBe(true);
    });
});
