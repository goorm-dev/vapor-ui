import { describe, expect, it } from 'vitest';

import type { IRRule } from '~/model/types';

import { emitCss } from './emit-css';

const rule = (o: Partial<IRRule> = {}): IRRule => ({
    kind: 'static',
    property: 'padding',
    value: 'var(--vapor-size-space-400)',
    rawValue: '$space-400',
    selectorContext: 'base',
    ...o,
} as IRRule);

describe('emitCss', () => {
    it('emits default rules inside @layer vapor-utilities', () => {
        const out = emitCss([rule()]);
        expect(out.cssText).toContain('@layer vapor-utilities');
        expect(out.cssText).toContain('padding: var(--vapor-size-space-400)');
        expect(out.classNamesPerRule).toHaveLength(1);
    });

    it('appends :pseudo selector for pseudo context', () => {
        const out = emitCss([rule({ selectorContext: ':hover' })]);
        const cls = out.classNamesPerRule[0];
        expect(out.cssText).toContain(`.${cls}:hover`);
    });

    it('appends ::pseudo-element for ::before context', () => {
        const out = emitCss([
            rule({ selectorContext: '::before', property: 'content', value: '""' }),
        ]);
        const cls = out.classNamesPerRule[0];
        expect(out.cssText).toContain(`.${cls}::before`);
    });

    it('wraps @media context in @media block', () => {
        const out = emitCss([
            rule({ selectorContext: '@media(min-width:768px)', property: 'padding' }),
        ]);
        expect(out.cssText).toMatch(/@media \(min-width: 768px\)\s*\{/);
    });

    it('composes @media + :pseudo nested (media wraps, class carries pseudo)', () => {
        const out = emitCss([rule({ selectorContext: '@media(min-width:768px):hover' })]);
        const cls = out.classNamesPerRule[0];
        expect(out.cssText).toMatch(/@media \(min-width: 768px\)/);
        expect(out.cssText).toContain(`.${cls}:hover`);
    });

    it('composes attribute selector as suffix on class', () => {
        const out = emitCss([rule({ selectorContext: '[data-active="true"]' })]);
        const cls = out.classNamesPerRule[0];
        expect(out.cssText).toContain(`.${cls}[data-active="true"]`);
    });

    it('composes self-ref selector via & replacement', () => {
        const out = emitCss([rule({ selectorContext: '&.selected' })]);
        const cls = out.classNamesPerRule[0];
        expect(out.cssText).toContain(`.${cls}.selected`);
    });

    it('dedupes identical rules — same className twice', () => {
        const out = emitCss([rule(), rule()]);
        expect(out.classNamesPerRule[0]).toBe(out.classNamesPerRule[1]);
        const cls = out.classNamesPerRule[0];
        const escaped = cls.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        expect((out.cssText.match(new RegExp(`\\.${escaped}\\b`, 'g')) ?? []).length).toBe(1);
    });

    it('is deterministic — same input twice → byte-identical', () => {
        const rules = [
            rule(),
            rule({ selectorContext: ':hover', value: 'var(--x)' }),
            rule({ property: 'margin', value: 'var(--y)' }),
        ];
        expect(emitCss(rules).cssText).toBe(emitCss(rules).cssText);
    });
});
