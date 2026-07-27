import { afterEach, describe, expect, it, vi } from 'vitest';

import type { ExtractCtx } from '../engine/types';
import { readEffectStyleToken } from '../variables';
import { shadowRule } from './shadow';

vi.mock('../variables', () => ({
    readEffectStyleToken: vi.fn(),
}));

const ctx = (): ExtractCtx => ({
    rootId: 'root',
    viewport: 'pc',
    boundVariables: undefined,
    filter: null,
});

const dropShadow = {
    type: 'DROP_SHADOW',
    color: { r: 0, g: 0, b: 0, a: 0.25 },
    offset: { x: 0, y: 2 },
    radius: 4,
    spread: 0,
} as const;

afterEach(() => {
    vi.clearAllMocks();
});

describe('shadowRule', () => {
    it('filterKeys = effects + effectStyleId', () => {
        const rule = shadowRule();
        expect(rule.filterKeys).toEqual(['effects', 'effectStyleId']);
    });

    it('shadow 계열 effect 만 emission, effectStyleId 없으면 raw', async () => {
        vi.mocked(readEffectStyleToken).mockResolvedValueOnce({ token: null, status: 'raw' });
        const node = {
            id: 'n',
            name: 'Card',
            effects: [dropShadow, { type: 'LAYER_BLUR', radius: 2 }],
        } as unknown as SceneNode;
        const rule = shadowRule();
        const out = await rule.extract(node, ctx());

        // LAYER_BLUR 는 제외 → 1개 emission
        expect(out).toHaveLength(1);
        expect(out[0]).toMatchObject({
            value: '0px 2px 4px 0px rgba(0,0,0,0.25)',
            token: null,
            tokenStatus: 'raw',
        });
        // readEffectStyleToken 은 1회 호출 (노드당 1개)
        expect(readEffectStyleToken).toHaveBeenCalledTimes(1);
    });

    it('shadow effect 없으면 미방출', async () => {
        const node = {
            id: 'n',
            name: 'Card',
            effects: [{ type: 'LAYER_BLUR', radius: 4 }],
        } as unknown as SceneNode;
        const rule = shadowRule();
        const out = await rule.extract(node, ctx());

        expect(out).toHaveLength(0);
        expect(readEffectStyleToken).not.toHaveBeenCalled();
    });

    it('INNER_SHADOW 도 포함, effectStyleId 있으면 토큰 해석', async () => {
        vi.mocked(readEffectStyleToken).mockResolvedValueOnce({
            token: 'shadow-card',
            status: 'ok',
        });
        const innerShadow = {
            type: 'INNER_SHADOW',
            color: { r: 0, g: 0, b: 0, a: 0.5 },
            offset: { x: 1, y: 1 },
            radius: 2,
            spread: 0,
        };
        const node = {
            id: 'n',
            name: 'Card',
            effects: [dropShadow, innerShadow],
            effectStyleId: 'S:abc',
        } as unknown as SceneNode;
        const rule = shadowRule();
        const out = await rule.extract(node, ctx());

        expect(out).toHaveLength(2);
        // 모든 항목이 같은 토큰을 공유 (1회 조회)
        expect(out[0]?.token).toBe('shadow-card');
        expect(out[1]?.token).toBe('shadow-card');
        expect(out[0]?.tokenStatus).toBe('ok');
        // INNER_SHADOW → inset
        expect(out[1]?.value).toMatch(/^inset/);
        expect(readEffectStyleToken).toHaveBeenCalledTimes(1);
    });

    it('effects 필드 없는 노드 → 미방출', async () => {
        const node = { id: 'n', name: 'Icon' } as unknown as SceneNode;
        const rule = shadowRule();
        const out = await rule.extract(node, ctx());

        expect(out).toHaveLength(0);
    });
});
