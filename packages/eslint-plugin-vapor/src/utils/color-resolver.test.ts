import { describe, expect, it } from 'vitest';

import { oklchToHex } from './color-resolver';

describe('oklchToHex', () => {
    it('converts white (1, 0, 0) to #ffffff', () => {
        expect(oklchToHex([1, 0, 0])).toBe('#ffffff');
    });
    it('converts black (0, 0, 0) to #000000', () => {
        expect(oklchToHex([0, 0, 0])).toBe('#000000');
    });
    it('emits 8-digit hex when alpha < 1', () => {
        const out = oklchToHex([1, 0, 0], 0.5);
        expect(out).toMatch(/^#ffffff[0-9a-f]{2}$/);
    });
});
