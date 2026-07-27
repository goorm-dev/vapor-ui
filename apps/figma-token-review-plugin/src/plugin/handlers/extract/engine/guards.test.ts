import { describe, expect, it } from 'vitest';

import type { ExtractCtx } from './types';
import { isText, notRoot, notVectorLike, sizingFixed } from './guards';

const ctx = (over: Partial<ExtractCtx> = {}): ExtractCtx => ({
    rootId: 'root',
    viewport: 'pc',
    boundVariables: undefined,
    filter: null,
    ...over,
});

describe('guards', () => {
    it('isText: TEXT 노드만 통과', () => {
        expect(isText.test({ type: 'TEXT' } as SceneNode, ctx())).toBe(true);
        expect(isText.test({ type: 'FRAME' } as SceneNode, ctx())).toBe(false);
    });

    it('notVectorLike: VECTOR 계열 차단', () => {
        expect(notVectorLike.test({ type: 'VECTOR' } as SceneNode, ctx())).toBe(false);
        expect(notVectorLike.test({ type: 'FRAME' } as SceneNode, ctx())).toBe(true);
    });

    it('notRoot: ctx.rootId 와 같은 id 차단', () => {
        expect(notRoot.test({ id: 'root' } as SceneNode, ctx())).toBe(false);
        expect(notRoot.test({ id: 'child' } as SceneNode, ctx())).toBe(true);
    });

    it('sizingFixed: 해당 축이 FIXED 일 때만 통과, 가드명에 축 포함', () => {
        const g = sizingFixed('layoutSizingHorizontal');
        expect(g.name).toBe('sizingFixed:layoutSizingHorizontal');
        expect(g.test({ layoutSizingHorizontal: 'FIXED' } as unknown as SceneNode, ctx())).toBe(true);
        expect(g.test({ layoutSizingHorizontal: 'HUG' } as unknown as SceneNode, ctx())).toBe(false);
        expect(g.test({} as SceneNode, ctx())).toBe(false);
    });
});
