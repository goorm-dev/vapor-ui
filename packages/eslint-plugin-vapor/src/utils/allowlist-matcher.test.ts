import { describe, expect, it } from 'vitest';

import { matchAllowlist } from './allowlist-matcher';

describe('matchAllowlist', () => {
    it('returns false for empty patterns', () => {
        expect(matchAllowlist('--vapor-app-x', [])).toBe(false);
    });
    it('matches exact name', () => {
        expect(matchAllowlist('--vapor-app-color', ['--vapor-app-color'])).toBe(true);
    });
    it('matches single * within last segment', () => {
        expect(matchAllowlist('--vapor-app-color', ['--vapor-app-*'])).toBe(true);
    });
    it('does not match across `-` separator when using single *', () => {
        expect(matchAllowlist('--vapor-app-color-x', ['--vapor-app-*'])).toBe(false);
    });
    it('returns false when no pattern matches', () => {
        expect(matchAllowlist('--vapor-color-blue-100', ['--vapor-app-*'])).toBe(false);
    });
});
