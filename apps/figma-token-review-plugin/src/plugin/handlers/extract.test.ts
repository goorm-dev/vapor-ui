import { describe, expect, it, vi } from 'vitest';

import { __testables } from './extract';

const { captureScreenshot, walkTree } = __testables;

describe('captureScreenshot', () => {
    it('base64-encodes exportAsync bytes as PNG at scale 1', async () => {
        const bytes = new Uint8Array([1, 2, 3, 4]);
        const frame = {
            exportAsync: vi.fn().mockResolvedValue(bytes),
        } as unknown as FrameNode;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (globalThis as any).figma = { base64Encode: (b: Uint8Array) => Buffer.from(b).toString('base64') };

        const out = await captureScreenshot(frame);
        expect(frame.exportAsync).toHaveBeenCalledWith({
            format: 'PNG',
            constraint: { type: 'SCALE', value: 1 },
        });
        expect(out).toBe(Buffer.from(bytes).toString('base64'));
    });
});

describe('walkTree', () => {
    it('emits parent before children, skips 🟨/🔶 subtrees, populates xywh', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const leaf = { id: 'l', type: 'TEXT', name: 'label', x: 5, y: 6, width: 7, height: 8 } as any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const skipped = { id: 's', type: 'GROUP', name: '🟨 legend', children: [leaf], x: 0, y: 0, width: 0, height: 0 } as any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const root = { id: 'r', type: 'FRAME', name: 'Root', children: [skipped, leaf], x: 0, y: 0, width: 100, height: 200 } as any;

        const tree = walkTree(root);

        const ids = tree.map((n) => n.id);
        expect(ids).toContain('r');
        expect(ids).toContain('l');
        expect(ids).not.toContain('s');
        expect(tree[0]?.id).toBe('r');
        const leafInfo = tree.find((n) => n.id === 'l')!;
        expect(leafInfo).toMatchObject({ parentId: 'r', childIds: [], x: 5, y: 6, w: 7, h: 8 });
    });
});
