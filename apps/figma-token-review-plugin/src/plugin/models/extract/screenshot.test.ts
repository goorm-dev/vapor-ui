/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it, vi } from 'vitest';

import { captureScreenshot } from './screenshot';

describe('captureScreenshot', () => {
    it('base64-encodes exportAsync bytes as PNG at scale 1', async () => {
        const bytes = new Uint8Array([1, 2, 3, 4]);
        const frame = {
            exportAsync: vi.fn().mockResolvedValue(bytes),
        } as unknown as FrameNode;

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
