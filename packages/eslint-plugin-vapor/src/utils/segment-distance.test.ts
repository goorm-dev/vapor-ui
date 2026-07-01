import { describe, expect, it } from 'vitest';

import { segmentDistance } from './segment-distance';

describe('segmentDistance', () => {
    it('returns 0 for identical strings', () => {
        expect(
            segmentDistance(
                '--vapor-color-foreground-primary-100',
                '--vapor-color-foreground-primary-100',
            ),
        ).toBe(0);
    });
    it('returns 1 for one-char typo within one segment', () => {
        expect(
            segmentDistance(
                '--vapor-color-foregruond-primary-100',
                '--vapor-color-foreground-primary-100',
            ),
        ).toBe(1);
    });
    it('returns null when segment counts differ', () => {
        expect(
            segmentDistance(
                '--vapor-color-foreground-primary',
                '--vapor-color-foreground-primary-100',
            ),
        ).toBe(null);
    });
    it('returns null when per-segment distance > 1', () => {
        expect(
            segmentDistance(
                '--vapor-color-xxxxxxxxxx-primary-100',
                '--vapor-color-foreground-primary-100',
            ),
        ).toBe(null);
    });
    it('returns null when total distance > 2', () => {
        expect(
            segmentDistance(
                '--vapr-clor-foregruond-primary-100',
                '--vapor-color-foreground-primary-100',
            ),
        ).toBe(null);
    });
    it('handles Damerau transposition as distance 1', () => {
        expect(segmentDistance('ab', 'ba')).toBe(1);
    });
});
