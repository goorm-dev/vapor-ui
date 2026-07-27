import { describe, expect, it } from 'vitest';

import type { ExtractCtx } from '../engine/types';
import { gapRule, paddingRule } from './space';

const ctx = (over: Partial<ExtractCtx> = {}): ExtractCtx => ({
    rootId: 'root',
    viewport: 'pc',
    boundVariables: undefined,
    filter: null,
    ...over,
});

describe('gapRule', () => {
    it('itemSpacing 있는 노드 → gap emission', async () => {
        const node = { id: 'n', name: 'N', itemSpacing: 8 } as unknown as SceneNode;
        const out = await gapRule.extract(node, ctx());
        expect(out).toEqual([
            { property: 'gap', value: '8px', token: null, appliedToken: null, tokenStatus: 'raw' },
        ]);
    });

    it('itemSpacing 없는 노드 → 미방출', async () => {
        const node = { id: 'n', name: 'N' } as unknown as SceneNode;
        expect(await gapRule.extract(node, ctx())).toEqual([]);
    });
});

describe('paddingRule', () => {
    const rule = paddingRule();

    it('filter 로 단일 방향만 허용 → 해당 필드만 emit', async () => {
        const node = {
            id: 'n',
            name: 'Box',
            paddingTop: 8,
            paddingRight: 8,
            paddingBottom: 8,
            paddingLeft: 8,
        } as unknown as SceneNode;
        const out = await rule.extract(node, ctx({ filter: new Set(['paddingTop']) }));
        expect(out).toEqual([
            {
                property: 'paddingTop',
                value: '8px',
                token: null,
                appliedToken: null,
                tokenStatus: 'raw',
            },
        ]);
    });

    it('padding 필드 없는 노드 → 미방출', async () => {
        const node = { id: 'n', name: 'N' } as unknown as SceneNode;
        expect(await rule.extract(node, ctx())).toEqual([]);
    });

    it('4방향 동일 → padding 으로 축약', async () => {
        const node = {
            id: 'n',
            name: 'Box',
            paddingTop: 16,
            paddingRight: 16,
            paddingBottom: 16,
            paddingLeft: 16,
        } as unknown as SceneNode;
        const out = await rule.extract(node, ctx());
        expect(out).toEqual([
            {
                property: 'padding',
                value: '16px',
                token: null,
                appliedToken: null,
                tokenStatus: 'raw',
            },
        ]);
    });
});
