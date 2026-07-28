import { describe, expect, it } from 'vitest';

import type { ExtractCtx } from '../engine/types';
import { RADIUS_BINDING_FIELDS, radiusRule } from './radius';

const ctx = (over: Partial<ExtractCtx> = {}): ExtractCtx => ({
    rootId: 'root',
    viewport: 'pc',
    boundVariables: undefined,
    filter: null,
    ...over,
});

describe('radiusRule', () => {
    const rule = radiusRule();

    it('filterKeys 는 5개 바인딩 필드 전체', () => {
        expect(rule.filterKeys).toEqual(RADIUS_BINDING_FIELDS);
    });

    it('uniform cornerRadius 숫자 → 1건 (바인딩 없으면 raw)', async () => {
        const node = { id: 'n', name: 'Card', cornerRadius: 8 } as unknown as SceneNode;
        const out = await rule.extract(node, ctx());
        expect(out).toEqual([
            { value: '8px', token: null, appliedToken: null, tokenStatus: 'raw' },
        ]);
    });

    it('cornerRadius 가 mixed(비숫자)면 미방출', async () => {
        const node = {
            id: 'n',
            name: 'Card',
            cornerRadius: Symbol('mixed'),
        } as unknown as SceneNode;
        expect(await rule.extract(node, ctx())).toEqual([]);
    });
});
