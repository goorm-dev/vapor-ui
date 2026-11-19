import { describe, expect, it } from 'vitest';

import { ROOT_CONTEXT, type RuleContext, nestContext, resolveSelector } from './selector';

const nest = (...keys: string[]): RuleContext => keys.reduce(nestContext, ROOT_CONTEXT);
const sel = (...keys: string[]) => resolveSelector(nest(...keys).selector, 'a');

describe('nestContext — each level resolves against its parent (Sass / postcss-nested)', () => {
    it.each([
        [[], '.a'],
        [[':hover'], '.a:hover'],
        [['::before'], '.a::before'],
        [['[data-x]'], '.a[data-x]'],
        [['&.on'], '.a.on'],
        [['& > span'], '.a > span'],
        [[':focus', '&:hover'], '.a:focus:hover'],
        [['[data-x]', '&:not(.z)'], '.a[data-x]:not(.z)'],
        [[':hover', '& > span'], '.a:hover > span'],
        [['& + &'], '.a + .a'],
        [['& > span', ':hover'], '.a > span:hover'],
    ])('%j → %s', (keys, expected) => {
        expect(sel(...keys)).toBe(expected);
    });

    it('distributes a comma parent over the child', () => {
        expect(sel(':hover, :focus', '::before')).toBe('.a:hover::before, .a:focus::before');
        expect(sel('&[data-a], &[data-b]', '&[data-c]')).toBe(
            '.a[data-a][data-c], .a[data-b][data-c]',
        );
    });

    it('takes the cartesian product of comma lists at both levels', () => {
        expect(sel(':hover, :focus', '[data-x], [data-y]')).toBe(
            '.a:hover[data-x], .a:hover[data-y], .a:focus[data-x], .a:focus[data-y]',
        );
    });

    it('does not split commas inside parentheses, brackets or strings', () => {
        expect(sel(':is(.x, .y)')).toBe('.a:is(.x, .y)');
        expect(sel('[data-v="a,b"]')).toBe('.a[data-v="a,b"]');
    });

    it('leaves `&` inside strings and escapes alone', () => {
        expect(sel('[data-v="&"]')).toBe('.a[data-v="&"]');
        expect(sel('&.x\\&y')).toBe('.a.x\\&y');
    });

    it('keeps at-rules outside the selector, outermost first, at any depth', () => {
        expect(nest('@media (min-width:1px)', ':hover', '@supports (display:grid)')).toEqual({
            atRules: ['@media (min-width:1px)', '@supports (display:grid)'],
            selector: '&:hover',
        });
        expect(nest(':hover', '@media  (x)')).toEqual({
            atRules: ['@media (x)'],
            selector: '&:hover',
        });
    });

    it('does not split an at-rule prelude on commas (media query list)', () => {
        expect(nest('@media print, (min-width: 1px)').atRules).toEqual([
            '@media print, (min-width: 1px)',
        ]);
    });

    it('rejects a comma branch that is not a nested selector', () => {
        expect(() => nest(':hover, div')).toThrow(/div/);
    });
});
