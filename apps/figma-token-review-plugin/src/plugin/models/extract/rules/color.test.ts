import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ExtractCtx } from '../engine/types';
import { captureTextShot } from '../text';
import { toToken, walk } from '../variables';
import { fillColorsRule, strokeColorsRule } from './color';

vi.mock('../variables', () => ({
    walk: vi.fn(),
    toToken: vi.fn(),
}));

vi.mock('../text', () => ({
    captureTextShot: vi.fn(),
}));

const ctx = (): ExtractCtx => ({
    rootId: 'root',
    viewport: 'pc' as const,
    boundVariables: undefined,
    filter: null,
});

describe('color rules', () => {
    beforeEach(() => {
        vi.mocked(walk).mockResolvedValue({ chain: [], finalHex: null });
        vi.mocked(toToken).mockReturnValue({ token: null, appliedToken: null, tokenStatus: 'raw' });
        vi.mocked(captureTextShot).mockResolvedValue(undefined);
    });

    it('fillColorsRule filterKeys = fills', () => {
        const rule = fillColorsRule();
        expect(rule.filterKeys).toEqual(['fills']);
    });

    it('TEXT fill → property text, background transparent, hex #000000, tokenStatus raw', async () => {
        const node = {
            id: 'n1',
            name: 'Label',
            type: 'TEXT',
            fills: [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 }, visible: true }],
            strokes: [],
            boundVariables: {},
            parent: null,
        } as unknown as SceneNode;
        const out = await fillColorsRule().extract(node, ctx());
        expect(out[0]?.property).toBe('text');
        // classifyBackground(node) with parent=null walks no ancestors → returns transparent
        expect(out[0]?.background).toEqual({ kind: 'transparent', hex: null });
        expect(out[0]?.hex).toBe('#000000');
        expect(out[0]?.tokenStatus).toBe('raw');
    });

    it('FRAME raw SOLID fill → property fill, hex lowercase', async () => {
        const node = {
            id: 'n2',
            name: 'Box',
            type: 'FRAME',
            fills: [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 }, visible: true }],
            strokes: [],
            boundVariables: {},
            parent: null,
        } as unknown as SceneNode;
        const out = await fillColorsRule().extract(node, ctx());
        expect(out[0]?.property).toBe('fill');
        expect(out[0]?.hex).toBe('#ff0000');
        expect(out[0]?.tokenStatus).toBe('raw');
    });

    it('strokeColorsRule filterKeys = strokes, property stroke, textShot 없음', async () => {
        const rule = strokeColorsRule();
        expect(rule.filterKeys).toEqual(['strokes']);
        const node = {
            id: 'n3',
            name: 'Box',
            type: 'FRAME',
            fills: [],
            strokes: [{ type: 'SOLID', color: { r: 0, g: 0, b: 1 }, visible: true }],
            boundVariables: {},
            parent: null,
        } as unknown as SceneNode;
        const out = await rule.extract(node, ctx());
        expect(out[0]?.property).toBe('stroke');
        expect(out[0]?.textShot).toBeUndefined();
        expect(out[0]?.hex).toBe('#0000ff');
    });

    it('bound fill → walk/toToken 호출 → token 해석', async () => {
        vi.mocked(walk).mockResolvedValueOnce({
            chain: [{ name: 'color/color-background-primary-100', tier: 'semantic' }],
            finalHex: '#001122',
        });
        vi.mocked(toToken).mockReturnValueOnce({
            token: 'color-background-primary-100',
            appliedToken: 'color-background-primary-100',
            tokenStatus: 'ok',
        });
        const node = {
            id: 'n4',
            name: 'Card',
            type: 'FRAME',
            fills: [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }],
            strokes: [],
            boundVariables: { fills: [{ id: 'var-token-1' }] },
            parent: null,
        } as unknown as SceneNode;
        const out = await fillColorsRule().extract(node, ctx());
        expect(out[0]?.token).toBe('color-background-primary-100');
        expect(out[0]?.tokenStatus).toBe('ok');
        expect(out[0]?.hex).toBe('#001122');
    });
});
