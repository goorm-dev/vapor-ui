import { describe, expect, it } from 'vitest';

import type { IRRule } from '~/models/types';

import { emitCss } from './emit-css';

const rule = (o: Partial<IRRule> = {}): IRRule =>
    ({
        kind: 'static',
        property: 'padding',
        value: 'var(--vapor-size-space-400)',
        rawValue: '$space-400',
        selectorContext: 'base',
        ...o,
    }) as IRRule;

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

    it('emits base group before at-rule groups (cascade: at-rule must win)', () => {
        const media = rule({ selectorContext: '@media(min-width:768px)', value: 'var(--m)' });
        const base = rule({ value: 'var(--b)' });
        const out = emitCss([media, base]);
        const basePos = out.cssText.indexOf('var(--b)');
        const mediaPos = out.cssText.indexOf('var(--m)');
        expect(basePos).toBeGreaterThan(-1);
        expect(mediaPos).toBeGreaterThan(basePos);
    });

    it('keeps compound @media (and-combined features) as a single at-rule', () => {
        const out = emitCss([
            rule({
                selectorContext: '@media (min-width: 768px) and (max-width: 1024px)',
            }),
        ]);
        expect(out.cssText).toMatch(
            /@media \(min-width: 768px\) and \(max-width: 1024px\)\s*\{/,
        );
        // 두 번째 feature 가 별도 at-rule 블록으로 쪼개지면 안 됨.
        expect(out.cssText).not.toMatch(/@and/);
    });

    it('supports @container queries with name + feature', () => {
        const out = emitCss([
            rule({ selectorContext: '@container sidebar (min-width: 400px)' }),
        ]);
        expect(out.cssText).toMatch(/@container sidebar \(min-width: 400px\)\s*\{/);
    });

    it('orders @media groups by ascending min-width regardless of input order', () => {
        // 1024 그룹 먼저, 768 그룹 뒤에 입력. 입력 순서대로 emit 되면 넓은 뷰포트에서
        // 768 규칙이 1024 를 덮는 cascade 버그 발생.
        const out = emitCss([
            rule({ selectorContext: '@media (min-width: 1024px)', value: 'var(--w)' }),
            rule({ selectorContext: '@media (min-width: 768px)', value: 'var(--n)' }),
        ]);
        const pos768 = out.cssText.indexOf('(min-width: 768px)');
        const pos1024 = out.cssText.indexOf('(min-width: 1024px)');
        expect(pos768).toBeGreaterThan(-1);
        expect(pos1024).toBeGreaterThan(pos768);
    });

    it('places at-rules without a min-width after width-sorted groups, then by key', () => {
        const out = emitCss([
            rule({ selectorContext: '@media (hover: hover)', value: 'var(--h)' }),
            rule({ selectorContext: '@media (min-width: 1024px)', value: 'var(--w)' }),
            rule({ selectorContext: '@media (min-width: 480px)', value: 'var(--n)' }),
            rule({ value: 'var(--b)' }),
        ]);
        const bPos = out.cssText.indexOf('var(--b)');
        const nPos = out.cssText.indexOf('var(--n)');
        const wPos = out.cssText.indexOf('var(--w)');
        const hPos = out.cssText.indexOf('var(--h)');
        // base < 480 < 1024 < hover.
        expect(bPos).toBeLessThan(nPos);
        expect(nPos).toBeLessThan(wPos);
        expect(wPos).toBeLessThan(hPos);
    });
});
