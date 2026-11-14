import { describe, expect, it } from 'vitest';

import { _cx } from './cx';

describe('_cx', () => {
    it('joins parts in order', () => {
        expect(_cx(['a', 'b c'])).toBe('a b c');
    });

    it('drops falsy parts', () => {
        expect(_cx(['a', false, null, undefined, '', 'b'])).toBe('a b');
    });

    it('keeps the first position of a repeated class', () => {
        expect(_cx(['a b', 'c a'])).toBe('a b c');
    });

    it('collapses extra whitespace', () => {
        expect(_cx(['  a   b ', '\tc\n'])).toBe('a b c');
    });

    it('returns an empty string for no classes', () => {
        expect(_cx([])).toBe('');
        expect(_cx([false, ''])).toBe('');
    });
});
