import { describe, expect, it } from 'vitest';

import { ROOT_CONTEXT, type RuleContext, nestContext } from '~/models/selector';
import type { IRRule } from '~/models/types';

import { type Block, emitBlocks, normalizeRules, signatureOf } from './emit-css';

const rule = (o: Partial<IRRule> = {}): IRRule =>
    ({
        kind: 'static',
        property: 'padding-top',
        value: 'var(--vapor-size-space-400)',
        rawValue: '$space-400',
        context: ROOT_CONTEXT,
        ...o,
    }) as IRRule;

/** 중첩 key 들을 차례로 연 context. */
const at = (...keys: string[]): RuleContext => keys.reduce(nestContext, ROOT_CONTEXT);

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
        const out = normalizeRules([rule(), rule({ context: at(':hover') })]);
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
            rule({ property: 'color', value: 'a', context: at('[data-x]') }),
            rule({ property: 'color', value: 'b' }),
            rule({ property: 'color', value: 'c', context: at(':hover') }),
        ]);
        expect(pos(css, '.X {')).toBeLessThan(pos(css, '.X[data-x]'));
        expect(pos(css, '.X[data-x]')).toBeLessThan(pos(css, '.X:hover'));
    });

    it('composes pseudo-element, self-ref and comma selectors', () => {
        const css = emit([
            rule({ property: 'content', value: '""', context: at('::before') }),
            rule({ property: 'color', value: 'a', context: at('&.selected') }),
            rule({ property: 'color', value: 'b', context: at(':hover, :focus-visible') }),
        ]);
        expect(css).toContain('.X::before {');
        expect(css).toContain('.X.selected {');
        expect(css).toContain('.X:hover, .X:focus-visible {');
    });

    it('at-rule groups come after selector groups', () => {
        const css = emit([
            rule({ value: 'var(--m)', context: at('@media(min-width:768px)') }),
            rule({ value: 'var(--h)', context: at(':hover') }),
            rule({ value: 'var(--b)' }),
        ]);
        expect(pos(css, 'var(--b)')).toBeLessThan(pos(css, 'var(--h)'));
        expect(pos(css, 'var(--h)')).toBeLessThan(pos(css, '@media(min-width:768px)'));
    });

    it.each([
        '@supports selector(a:hover)',
        '@supports (display:grid) and selector(:has(a:hover))',
        '@container card (min-width:400px)',
        '@media(min-width:768px)',
    ])('emits the at-rule prelude as written: %s', (prelude) => {
        expect(emit([rule({ context: at(prelude) })])).toContain(`${prelude} {`);
    });

    it('nests a pseudo inside its media block', () => {
        const css = emit([rule({ context: at('@media(min-width:768px)', ':hover') })]);
        expect(css).toMatch(/@media\(min-width:768px\) \{\s*\.X:hover \{/);
    });

    it('orders min-width ascending and max-width descending', () => {
        const min = emit([
            rule({ value: 'var(--w)', context: at('@media (min-width: 1024px)') }),
            rule({ value: 'var(--n)', context: at('@media (min-width: 768px)') }),
        ]);
        expect(pos(min, '768px')).toBeLessThan(pos(min, '1024px'));
        const max = emit([
            rule({ value: 'var(--n)', context: at('@media (max-width: 768px)') }),
            rule({ value: 'var(--w)', context: at('@media (max-width: 1024px)') }),
        ]);
        expect(pos(max, '1024px')).toBeLessThan(pos(max, '768px'));
    });

    it('keeps compound and container at-rules intact', () => {
        const css = emit([
            rule({ context: at('@media (min-width: 768px) and (max-width: 1024px)') }),
            rule({ property: 'gap', context: at('@container sidebar (min-width: 400px)') }),
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

    it('dynamic rule → var(slot), no @property registration', () => {
        const dyn = rule({
            kind: 'dynamic',
            property: 'color',
            slotId: 's0',
            sourceExpr: 'p',
        } as Partial<IRRule>);
        const out = emitBlocks([block([dyn], 'A')], { mode: 'readable' }).cssText;
        expect(out).toContain('.A { color: var(--vapor-_s0); }');
        // @property inherits:false 는 ::before / 하위 selector 가 slot 을 못 읽게 만든다.
        expect(out).not.toContain('@property');
    });

    it('prod mode uses the short slot variable prefix', () => {
        const dyn = rule({ kind: 'dynamic', slotId: 's0', sourceExpr: 'p' } as Partial<IRRule>);
        expect(emitBlocks([block([dyn])], { mode: 'hashed' }).cssText).toContain('var(--_s0)');
    });

    it('is deterministic', () => {
        const rules = [rule(), rule({ context: at(':hover') })];
        expect(emit(rules)).toBe(emit(rules));
    });
});
