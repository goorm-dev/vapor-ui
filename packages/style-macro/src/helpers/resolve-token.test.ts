import { describe, expect, it } from 'vitest';

import { margin } from '~/tokens/margin';
import { space } from '~/tokens/space';

import { _resolveToken } from './resolve-token';

const v = (n: string) => space[n as keyof typeof space];

describe('_resolveToken — same `$token` grammar as compile time (models/token-ref)', () => {
    it.each([
        ['$space-100', v('space-100')],
        ['$space-100 $space-200', `${v('space-100')} ${v('space-200')}`],
        ['calc($space-100 * -1)', `calc(${v('space-100')} * -1)`],
        ['0 $space-100', `0 ${v('space-100')}`],
    ])('resolves tokens at component boundaries: %j', (input, expected) => {
        expect(_resolveToken(space, input)).toBe(expected);
    });

    it.each([['"$space-100"'], ['url($space-100)'], ['12px'], ['$5']])(
        'leaves non-token text as written: %j',
        (input) => {
            expect(_resolveToken(space, input)).toBe(input);
        },
    );

    it.each([['$nope'], ['-$space-100'], ['$space-100px']])(
        'keeps an unknown or glued token verbatim (invalid CSS) instead of guessing: %j',
        (input) => {
            // `$nope` → `nope` would silently become a different valid value (e.g. `$red` → `red`).
            expect(_resolveToken(space, input)).toBe(input);
        },
    );

    it('resolves negative keys (`$-space-*` on margin)', () => {
        const neg = margin['-space-100' as keyof typeof margin];
        expect(neg).toBeDefined();
        expect(_resolveToken(margin, '$-space-100')).toBe(neg);
        expect(_resolveToken(margin, '0 $-space-100')).toBe(`0 ${neg}`);
    });

    it('numbers and nullish values are unchanged', () => {
        expect(_resolveToken(space, 4, 'px')).toBe('4px');
        expect(_resolveToken(space, 4)).toBe('4');
        expect(_resolveToken(space, null)).toBeUndefined();
        expect(_resolveToken(space, undefined)).toBeUndefined();
    });
});
