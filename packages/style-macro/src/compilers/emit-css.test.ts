import { describe, expect, it } from 'vitest';

import type { IRRule } from '~/models/types';

import { type Block, emitBlocks, normalizeRules, signatureOf } from './emit-css';

const rule = (o: Partial<IRRule> = {}): IRRule =>
    ({
        kind: 'static',
        property: 'padding-top',
        value: 'var(--vapor-size-space-400)',
        rawValue: '$space-400',
        selectorContext: 'base',
        ...o,
    }) as IRRule;

const block = (rules: IRRule[], className = 'X'): Block => ({ className, rules });
const emit = (rules: IRRule[], layer?: string) =>
    emitBlocks([block(rules)], { mode: 'readable', layer }).cssText;
const pos = (css: string, needle: string) => {
    const i = css.indexOf(needle);
    expect(i, needle).toBeGreaterThan(-1);
    return i;
};

describe('normalizeRules — last wins per selector + property', () => {
    it('keeps the later value and moves it to the later position', () => {
        const out = normalizeRules([
            rule({ property: 'border-top-color', value: 'red' }),
            rule({ property: 'border', value: '1px solid' }),
            rule({ property: 'border-top-color', value: 'blue' }),
        ]);
        expect(out.map((r) => `${r.property}:${(r as { value: string }).value}`)).toEqual([
            'border:1px solid',
            'border-top-color:blue',
        ]);
    });

    it('treats different selector contexts as different slots', () => {
        const out = normalizeRules([rule(), rule({ selectorContext: ':hover' })]);
        expect(out).toHaveLength(2);
    });

    it('a dynamic rule replaces a static rule on the same slot', () => {
        const dyn = rule({ kind: 'dynamic', slotId: 's0', sourceExpr: 'p' } as Partial<IRRule>);
        expect(normalizeRules([rule(), dyn])).toEqual([dyn]);
    });
});

describe('signatureOf', () => {
    it('is order-sensitive and value-sensitive', () => {
        const a = rule({ property: 'color', value: 'red' });
        const b = rule({ property: 'gap', value: '0' });
        expect(signatureOf([a, b])).not.toBe(signatureOf([b, a]));
        expect(signatureOf([a])).not.toBe(
            signatureOf([rule({ property: 'color', value: 'blue' })]),
        );
    });
});

describe('emitBlocks', () => {
    it('one block = one class rule holding every base declaration in order', () => {
        const css = emit([
            rule({ property: 'color', value: 'red' }),
            rule({ property: 'gap', value: '0' }),
        ]);
        expect(css).toMatch(/\.X \{ color: red; gap: 0; \}/);
    });

    it('wraps blocks in @layer vapor-utilities by default, with the order statement first', () => {
        const css = emit([rule()]);
        expect(css.startsWith('@layer vapor-utilities;')).toBe(true);
        expect(css).toMatch(/@layer vapor-utilities \{[\s\S]*\.X \{/);
    });

    it('uses the given layer', () => {
        const css = emit([rule()], 'vapor-composites');
        expect(css).toMatch(/@layer vapor-composites \{[\s\S]*\.X \{/);
        expect(css).not.toContain('vapor-utilities');
    });

    it('returns an empty string for no blocks', () => {
        expect(emitBlocks([], { mode: 'readable' }).cssText).toBe('');
    });

    it('nested selector groups follow the base group in declaration order', () => {
        const css = emit([
            rule({ property: 'color', value: 'a', selectorContext: '[data-x]' }),
            rule({ property: 'color', value: 'b' }),
            rule({ property: 'color', value: 'c', selectorContext: ':hover' }),
        ]);
        expect(pos(css, '.X {')).toBeLessThan(pos(css, '.X[data-x]'));
        expect(pos(css, '.X[data-x]')).toBeLessThan(pos(css, '.X:hover'));
    });

    it('composes pseudo-element, self-ref and comma selectors', () => {
        const css = emit([
            rule({ property: 'content', value: '""', selectorContext: '::before' }),
            rule({ property: 'color', value: 'a', selectorContext: '&.selected' }),
            rule({ property: 'color', value: 'b', selectorContext: ':hover, :focus-visible' }),
        ]);
        expect(css).toContain('.X::before {');
        expect(css).toContain('.X.selected {');
        expect(css).toContain('.X:hover, .X:focus-visible {');
    });

    it('at-rule groups come after selector groups', () => {
        const css = emit([
            rule({ value: 'var(--m)', selectorContext: '@media(min-width:768px)' }),
            rule({ value: 'var(--h)', selectorContext: ':hover' }),
            rule({ value: 'var(--b)' }),
        ]);
        expect(pos(css, 'var(--b)')).toBeLessThan(pos(css, 'var(--h)'));
        expect(pos(css, 'var(--h)')).toBeLessThan(pos(css, '@media (min-width: 768px)'));
    });

    it('nests a pseudo inside its media block', () => {
        const css = emit([rule({ selectorContext: '@media(min-width:768px):hover' })]);
        expect(css).toMatch(/@media \(min-width: 768px\) \{\s*\.X:hover \{/);
    });

    it('orders min-width ascending and max-width descending', () => {
        const min = emit([
            rule({ value: 'var(--w)', selectorContext: '@media (min-width: 1024px)' }),
            rule({ value: 'var(--n)', selectorContext: '@media (min-width: 768px)' }),
        ]);
        expect(pos(min, '768px')).toBeLessThan(pos(min, '1024px'));
        const max = emit([
            rule({ value: 'var(--n)', selectorContext: '@media (max-width: 768px)' }),
            rule({ value: 'var(--w)', selectorContext: '@media (max-width: 1024px)' }),
        ]);
        expect(pos(max, '1024px')).toBeLessThan(pos(max, '768px'));
    });

    it('keeps compound and container at-rules intact', () => {
        const css = emit([
            rule({ selectorContext: '@media (min-width: 768px) and (max-width: 1024px)' }),
            rule({ property: 'gap', selectorContext: '@container sidebar (min-width: 400px)' }),
        ]);
        expect(css).toMatch(/@media \(min-width: 768px\) and \(max-width: 1024px\) \{/);
        expect(css).toMatch(/@container sidebar \(min-width: 400px\) \{/);
    });

    it('emits blocks in input order and skips a repeated class', () => {
        const css = emitBlocks([block([rule()], 'A'), block([rule()], 'B'), block([rule()], 'A')], {
            mode: 'readable',
        }).cssText;
        expect(pos(css, '.A {')).toBeLessThan(pos(css, '.B {'));
        expect(css.match(/\.A \{/g)).toHaveLength(1);
    });

    it('dynamic rule → var(slot) + @property outside the layer, declared once', () => {
        const dyn = rule({
            kind: 'dynamic',
            property: 'color',
            slotId: 's0',
            sourceExpr: 'p',
        } as Partial<IRRule>);
        const out = emitBlocks([block([dyn], 'A'), block([dyn], 'B')], {
            mode: 'readable',
            layer: 'vapor-composites',
        }).cssText;
        expect(out).toContain('.A { color: var(--vapor-_s0); }');
        expect(
            out.match(/@property --vapor-_s0 \{ syntax: '\*'; inherits: false; \}/g),
        ).toHaveLength(1);
        expect(pos(out, '@property')).toBeLessThan(pos(out, '@layer vapor-composites {'));
    });

    it('prod mode uses the short slot variable prefix', () => {
        const dyn = rule({ kind: 'dynamic', slotId: 's0', sourceExpr: 'p' } as Partial<IRRule>);
        expect(emitBlocks([block([dyn])], { mode: 'hashed' }).cssText).toContain('var(--_s0)');
    });

    it('is deterministic', () => {
        const rules = [rule(), rule({ selectorContext: ':hover' })];
        expect(emit(rules)).toBe(emit(rules));
    });
});
