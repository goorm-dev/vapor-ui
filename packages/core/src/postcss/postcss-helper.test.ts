import { describe, expect, it } from 'vitest';
import postcss from 'postcss';

import { vaporCustomMedia } from './index';
import { DEFAULT_BREAKPOINTS, resolveBreakpoints } from './breakpoints';

describe('vaporCustomMedia', () => {
    it('exposes defaults', () => {
        expect(resolveBreakpoints()).toEqual(DEFAULT_BREAKPOINTS);
    });

    it('merges overrides', () => {
        const r = resolveBreakpoints({ md: '(max-width: 900px)' });
        expect(r.md).toBe('(max-width: 900px)');
        expect(r.sm).toBe(DEFAULT_BREAKPOINTS.sm);
    });

    it('throws on unknown BP', () => {
        expect(() => resolveBreakpoints({ xl: '(min-width: 1600px)' } as never)).toThrow(
            /unknown breakpoint "xl"/,
        );
    });

    it('expands @media (--vapor-sm) to override value', async () => {
        const input = `@media (--vapor-sm) { .a { color: red } }`;
        const result = await postcss([vaporCustomMedia({ sm: '(max-width: 600px)' })]).process(input, {
            from: undefined,
        });
        expect(result.css).toContain('(max-width: 600px)');
    });

    it('expands using defaults when no overrides', async () => {
        const input = `@media (--vapor-md) { .a { color: red } }`;
        const result = await postcss([vaporCustomMedia()]).process(input, { from: undefined });
        expect(result.css).toContain(DEFAULT_BREAKPOINTS.md);
    });
});
