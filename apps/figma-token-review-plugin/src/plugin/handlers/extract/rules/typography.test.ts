import { afterEach, describe, expect, it, vi } from 'vitest';

import type { ExtractCtx } from '../engine/types';
import { classifyTextNode } from '../text';
import { TYPOGRAPHY_KEYS, typographyRule } from './typography';

vi.mock('../text', () => ({
    classifyTextNode: vi.fn(),
}));

const ctx = (over: Partial<ExtractCtx> = {}): ExtractCtx => ({
    rootId: 'root',
    viewport: 'pc',
    boundVariables: undefined,
    filter: null,
    ...over,
});

const makeTextNode = (chars = 'Hello world', extra: Record<string, unknown> = {}) =>
    ({
        id: 'n1',
        name: 'Label',
        type: 'TEXT',
        characters: chars,
        ...extra,
    }) as unknown as SceneNode;

afterEach(() => {
    vi.restoreAllMocks();
});

describe('typographyRule', () => {
    it('filterKeys = TYPOGRAPHY_KEYS', () => {
        const rule = typographyRule();
        expect(rule.filterKeys).toEqual(TYPOGRAPHY_KEYS);
    });

    it('guards include isText (TEXT 통과, FRAME 차단)', () => {
        const rule = typographyRule();
        const textNode = makeTextNode();
        const frameNode = { id: 'f', name: 'Box', type: 'FRAME' } as unknown as SceneNode;
        const c = ctx();
        const pass = (n: SceneNode) => rule.guards?.every((g) => g.test(n, c));
        expect(pass(textNode)).toBe(true);
        expect(pass(frameNode)).toBe(false);
    });

    it('seg 있으면 resolved 각 필드 채움', async () => {
        const seg = {
            fontSize: 16,
            lineHeight: { unit: 'PERCENT', value: 150 },
            letterSpacing: { unit: 'PIXELS', value: 0.5 },
            fontName: { family: 'Pretendard', style: 'Regular' },
        };
        vi.mocked(classifyTextNode).mockResolvedValueOnce({
            appliedStatus: 'styled-clean',
            textStyle: 'Heading/H1',
            overriddenFields: [],
            seg,
        });
        const rule = typographyRule();
        const node = makeTextNode('Hello world');
        const out = await rule.extract(node, ctx({ viewport: 'tablet' }));

        expect(out).toHaveLength(1);
        expect(out[0]).toMatchObject({
            characters: 'Hello world',
            textStyle: 'Heading/H1',
            viewport: 'tablet',
            appliedStatus: 'styled-clean',
            overriddenFields: [],
            resolved: {
                fontSize: 16,
                lineHeight: { unit: 'PERCENT', value: 150 },
                letterSpacing: { unit: 'PIXELS', value: 0.5 },
                fontName: { family: 'Pretendard', style: 'Regular' },
            },
        });
    });

    it('seg null 이면 resolved 전 필드 null', async () => {
        vi.mocked(classifyTextNode).mockResolvedValueOnce({
            appliedStatus: 'raw',
            textStyle: null,
            overriddenFields: [],
            seg: null,
        });
        const rule = typographyRule();
        const node = makeTextNode('Hi');
        const out = await rule.extract(node, ctx());

        expect(out[0]?.resolved).toEqual({
            fontSize: null,
            lineHeight: null,
            letterSpacing: null,
            fontName: null,
        });
    });

    it('characters 는 최대 20자로 잘림', async () => {
        vi.mocked(classifyTextNode).mockResolvedValueOnce({
            appliedStatus: 'raw',
            textStyle: null,
            overriddenFields: [],
            seg: null,
        });
        const rule = typographyRule();
        const long = 'A'.repeat(30);
        const node = makeTextNode(long);
        const out = await rule.extract(node, ctx());

        expect(out[0]?.characters).toHaveLength(20);
    });

    it('viewport from ctx', async () => {
        vi.mocked(classifyTextNode).mockResolvedValueOnce({
            appliedStatus: 'raw',
            textStyle: null,
            overriddenFields: [],
            seg: null,
        });
        const rule = typographyRule();
        const node = makeTextNode();
        const out = await rule.extract(node, ctx({ viewport: 'mobile' }));

        expect(out[0]?.viewport).toBe('mobile');
    });
});
