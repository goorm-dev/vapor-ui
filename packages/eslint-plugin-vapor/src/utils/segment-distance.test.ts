import { describe, expect, it } from 'vitest';

import { segmentDistance } from './segment-distance';

describe('segmentDistance', () => {
    it('returns 0 for identical segment arrays', () => {
        const segA = ['vapor', 'color', 'foreground', 'primary', '100'];
        const segB = ['vapor', 'color', 'foreground', 'primary', '100'];

        expect(segmentDistance(segA, segB)).toBe(0);
    });

    it('returns 0 for two empty arrays', () => {
        const segA: string[] = [];
        const segB: string[] = [];

        expect(segmentDistance(segA, segB)).toBe(0);
    });

    it('returns null when segment counts differ', () => {
        const segA = ['vapor', 'color'];
        const segB = ['vapor', 'color', '100'];

        expect(segmentDistance(segA, segB)).toBe(null);
    });

    it('returns 1 for a single one-char typo in one segment', () => {
        const segA = ['vapor', 'colr', 'foreground'];
        const segB = ['vapor', 'color', 'foreground'];

        expect(segmentDistance(segA, segB)).toBe(1);
    });

    it('counts a transposition within a segment as 1', () => {
        const segA = ['vapor', 'oclor', 'foreground'];
        const segB = ['vapor', 'color', 'foreground'];

        expect(segmentDistance(segA, segB)).toBe(1);
    });

    it('returns 2 when two segments each have distance 1', () => {
        const segA = ['vapr', 'colr', 'foreground'];
        const segB = ['vapor', 'color', 'foreground'];

        expect(segmentDistance(segA, segB)).toBe(2);
    });

    it('returns null when total distance exceeds 2', () => {
        const segA = ['vapr', 'colr', 'foregroun'];
        const segB = ['vapor', 'color', 'foreground'];

        expect(segmentDistance(segA, segB)).toBe(null);
    });

    it('returns null when any single segment has distance > 1', () => {
        const segA = ['vapor', 'xxxxx', 'foreground'];
        const segB = ['vapor', 'color', 'foreground'];

        expect(segmentDistance(segA, segB)).toBe(null);
    });

    it('treats an empty segment vs one-char segment as distance 1', () => {
        const segA = ['', 'color'];
        const segB = ['a', 'color'];

        expect(segmentDistance(segA, segB)).toBe(1);
    });

    it('returns null for empty segment vs multi-char segment', () => {
        const segA = [''];
        const segB = ['ab'];

        expect(segmentDistance(segA, segB)).toBe(null);
    });
});
