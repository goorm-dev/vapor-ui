import { describe, expect, it } from 'vitest';

import { findTokenRefs } from './token-ref';

const names = (v: string) => findTokenRefs(v).map((r) => (r.glued ? `~${r.name}` : r.name));

describe('findTokenRefs', () => {
    it.each([
        ['$a', ['a']],
        ['$a $b-1', ['a', 'b-1']],
        ['calc($a * 2)', ['a']],
        ['$a,$b', ['a', 'b']],
        ['$a/$b', ['a', 'b']],
        ['', []],
        ['$', []],
        ['$5', []],
        ['10px', []],
    ])('%j → %j', (value, expected) => {
        expect(names(value)).toEqual(expected);
    });

    it.each([['"$a"'], ["'$a'"], ['"x\\"$a"'], ['url($a)'], ['URL($a)'], ['url("$a)")'], ['\\$a']])(
        'ignores `$` inside strings, url() and escapes: %j',
        (value) => {
            expect(names(value)).toEqual([]);
        },
    );

    it('resumes after a string or url()', () => {
        expect(names('"$x" $a url($y) $b')).toEqual(['a', 'b']);
    });

    it('treats a non-url function as a boundary', () => {
        expect(names('myurl($a)')).toEqual(['a']);
    });

    it.each([
        ['-$a', ['~a']],
        ['x$a', ['~a']],
        ['$a%', ['~a']],
        ['$a!important', ['~a']],
    ])('marks a token glued to other text: %j', (value, expected) => {
        expect(names(value)).toEqual(expected);
    });

    it('treats an unterminated string as running to the end', () => {
        expect(names('"$a')).toEqual([]);
    });
});
