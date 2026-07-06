import { describe, expect, it } from 'vitest';

import type { Tuple } from '~/model/types';

import { emitCss } from './emit-css';

const t = (o: Partial<Tuple>): Tuple => ({
    property: 'padding',
    propertyShort: 'p',
    valueShort: '400',
    cssValue: 'var(--vapor-size-space-400)',
    condition: { kind: 'default' },
    ...o,
});

describe('emitCss', () => {
    it('emits default rules inside @layer vapor-utilities', () => {
        const css = emitCss([t({})]);
        expect(css).toContain('@layer vapor-utilities');
        expect(css).toMatch(/\._p-400\s*\{\s*padding:\s*var\(--vapor-size-space-400\);\s*\}/);
    });

    it('orders: default → sm → md → lg → @media (sorted) → pseudo (fixed order)', () => {
        const tuples: Tuple[] = [
            t({ condition: { kind: 'pseudo', name: '_hover' }, valueShort: 'h' }),
            t({
                condition: { kind: 'raw-media', query: '(min-width: 9999px)', hash: 'zzzzzzzz' },
                valueShort: 'z',
            }),
            t({ condition: { kind: 'named-bp', name: 'lg' }, valueShort: 'l' }),
            t({ condition: { kind: 'default' }, valueShort: 'd' }),
            t({ condition: { kind: 'named-bp', name: 'sm' }, valueShort: 's' }),
            t({
                condition: { kind: 'raw-media', query: '(min-width: 1000px)', hash: 'aaaaaaaa' },
                valueShort: 'a',
            }),
            t({ condition: { kind: 'named-bp', name: 'md' }, valueShort: 'm' }),
            t({ condition: { kind: 'pseudo', name: '_focus' }, valueShort: 'f' }),
        ];
        const css = emitCss(tuples);
        const positions = [
            '_p-d',
            '_sm-p-s',
            '_md-p-m',
            '_lg-p-l',
            '_mqaaaaaa-p-a',
            '_mqzzzzzz-p-z',
            '_focus-p-f',
            '_hover-p-h',
        ].map((cls) => css.indexOf(cls));
        const sorted = [...positions].sort((a, b) => a - b);
        expect(positions).toEqual(sorted);
        expect(positions.every((p) => p >= 0)).toBe(true);
    });

    it('dedupes identical tuples', () => {
        const dup = [t({}), t({})];
        const css = emitCss(dup);
        expect((css.match(/\._p-400/g) ?? []).length).toBe(1);
    });

    it('wraps named BP in @media (--vapor-<name>)', () => {
        const css = emitCss([
            t({ condition: { kind: 'named-bp', name: 'sm' }, valueShort: '100' }),
        ]);
        expect(css).toMatch(/@media \(--vapor-sm\)\s*\{\s*\._sm-p-100/);
    });

    it('wraps raw @media using raw query string', () => {
        const css = emitCss([
            t({
                condition: { kind: 'raw-media', query: '(min-width: 2560px)', hash: 'abcdef12' },
                valueShort: '400',
            }),
        ]);
        expect(css).toMatch(/@media \(min-width: 2560px\)\s*\{\s*\._mqabcdef-p-400/);
    });

    it('appends :pseudo selector', () => {
        const css = emitCss([
            t({ condition: { kind: 'pseudo', name: '_hover' }, valueShort: 'h' }),
        ]);
        expect(css).toMatch(/\._hover-p-h:hover\s*\{/);
    });

    it('is deterministic — same input twice → byte-identical', () => {
        const tuples: Tuple[] = [
            t({}),
            t({ condition: { kind: 'pseudo', name: '_hover' }, valueShort: 'h' }),
            t({ condition: { kind: 'named-bp', name: 'sm' }, valueShort: 's' }),
        ];
        expect(emitCss(tuples)).toBe(emitCss(tuples));
    });

    it('honors source order for default-bucket tuples', () => {
        const before = emitCss([
            t({ property: 'all', propertyShort: 'a', valueShort: 'unset', cssValue: 'unset' }),
            t({}),
        ]);
        const after = emitCss([
            t({}),
            t({ property: 'all', propertyShort: 'a', valueShort: 'unset', cssValue: 'unset' }),
        ]);
        // `all` before padding vs padding before `all` — order must reflect input
        expect(before.indexOf('_a-unset')).toBeLessThan(before.indexOf('_p-400'));
        expect(after.indexOf('_p-400')).toBeLessThan(after.indexOf('_a-unset'));
    });
});
