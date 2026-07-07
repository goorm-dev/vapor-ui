import { describe, expect, it, vi } from 'vitest';

import { __testables } from './extract';

const { captureScreenshot, walkTree } = __testables;

// ---------------------------------------------------------------------------
// Factory helpers
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function makeFrame(opts: { id?: string; children?: any[] } = {}): any {
    const id = opts.id ?? 'frame';
    return {
        id,
        type: 'FRAME',
        name: id,
        children: opts.children ?? [],
        x: 0,
        y: 0,
        width: 100,
        height: 100,
    };
}

function makeTextNode(
    opts: {
        id?: string;
        characters?: string;
        boundTextStyleName?: string;
        classifyThrows?: boolean;
    } = {},
): any {
    const id = opts.id ?? 'text';
    const seg = {
        textStyleId: opts.boundTextStyleName ? `style-${id}` : undefined,
        fontName: { family: 'Inter', style: 'Regular' },
        fontSize: 14,
        lineHeight: { unit: 'AUTO' },
        letterSpacing: { unit: 'PERCENT', value: 0 },
        boundVariables: {},
    };
    return {
        id,
        type: 'TEXT',
        name: id,
        children: [],
        x: 0,
        y: 0,
        width: 100,
        height: 20,
        characters: opts.characters ?? '',
        getStyledTextSegments: opts.classifyThrows
            ? () => {
                  throw new Error('classify failed');
              }
            : vi.fn().mockReturnValue([seg]),
    };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('captureScreenshot', () => {
    it('base64-encodes exportAsync bytes as PNG at scale 1', async () => {
        const bytes = new Uint8Array([1, 2, 3, 4]);
        const frame = {
            exportAsync: vi.fn().mockResolvedValue(bytes),
        } as unknown as FrameNode;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (globalThis as any).figma = {
            base64Encode: (b: Uint8Array) => Buffer.from(b).toString('base64'),
        };

        const out = await captureScreenshot(frame);
        expect(frame.exportAsync).toHaveBeenCalledWith({
            format: 'PNG',
            constraint: { type: 'SCALE', value: 1 },
        });
        expect(out).toBe(Buffer.from(bytes).toString('base64'));
    });
});

describe('walkTree', () => {
    it('emits parent before children, skips 🟨/🔶 subtrees, populates xywh', async () => {
        const leaf = {
            id: 'l',
            type: 'TEXT',
            name: 'label',
            x: 5,
            y: 6,
            width: 7,
            height: 8,
        } as any;

        const skipped = {
            id: 's',
            type: 'GROUP',
            name: '🟨 legend',
            children: [leaf],
            x: 0,
            y: 0,
            width: 0,
            height: 0,
        } as any;

        const root = {
            id: 'r',
            type: 'FRAME',
            name: 'Root',
            children: [skipped, leaf],
            x: 0,
            y: 0,
            width: 100,
            height: 200,
        } as any;

        const tree = await walkTree(root);

        const ids = tree.map((n) => n.id);
        expect(ids).toContain('r');
        expect(ids).toContain('l');
        expect(ids).not.toContain('s');
        expect(tree[0]?.id).toBe('r');
        const leafInfo = tree.find((n) => n.id === 'l')!;
        expect(leafInfo).toMatchObject({ parentId: 'r', childIds: [], x: 5, y: 6, w: 7, h: 8 });
    });

    it('walkTree TEXT 노드는 characters(60자 컷) 와 textStyle 을 담는다', async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (globalThis as any).figma = {
            getStyleByIdAsync: vi.fn().mockResolvedValue({
                name: 'body2',
                fontName: { family: 'Inter', style: 'Regular' },
                fontSize: 14,
                lineHeight: { unit: 'AUTO' },
                letterSpacing: { unit: 'PERCENT', value: 0 },
            }),
        };
        const frame = makeFrame({
            children: [
                makeTextNode({
                    id: 't1',
                    characters: 'a'.repeat(100),
                    boundTextStyleName: 'body2',
                }),
            ],
        });
        const tree = await walkTree(frame);
        const text = tree.find((n) => n.id === 't1')!;
        expect(text.characters).toBe('a'.repeat(60));
        expect(text.textStyle).toBe('body2');
    });

    it('walkTree 비-TEXT 노드는 characters/textStyle 이 undefined', async () => {
        const frame = makeFrame({ children: [makeFrame({ id: 'f2' })] });
        const tree = await walkTree(frame);
        const inner = tree.find((n) => n.id === 'f2')!;
        expect(inner.characters).toBeUndefined();
        expect(inner.textStyle).toBeUndefined();
    });

    it('walkTree 는 classifyTextNode 실패해도 노드를 유지하고 textStyle 만 생략', async () => {
        const frame = makeFrame({
            children: [
                makeTextNode({
                    id: 't3',
                    characters: 'x',
                    classifyThrows: true,
                }),
            ],
        });
        const tree = await walkTree(frame);
        const text = tree.find((n) => n.id === 't3')!;
        expect(text).toBeDefined();
        expect(text.characters).toBe('x');
        expect(text.textStyle).toBeUndefined();
    });
});
