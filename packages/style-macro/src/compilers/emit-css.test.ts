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
        expect(out.cssText).toMatch(/@media \(min-width: 768px\) and \(max-width: 1024px\)\s*\{/);
        // 두 번째 feature 가 별도 at-rule 블록으로 쪼개지면 안 됨.
        expect(out.cssText).not.toMatch(/@and/);
    });

    it('supports @container queries with name + feature', () => {
        const out = emitCss([rule({ selectorContext: '@container sidebar (min-width: 400px)' })]);
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

    it('places at-rules without a width feature before width-sorted groups (Compiled sortAtRules)', () => {
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
        // base < hover(width 없음) < 480 < 1024.
        expect(bPos).toBeLessThan(hPos);
        expect(hPos).toBeLessThan(nPos);
        expect(nPos).toBeLessThan(wPos);
    });
});

// 수집기가 프로젝트 전체 룰을 한 번에 넘기므로, 입력(=파일) 순서와 무관하게
// cascade 가 결정되어야 한다 (Compiled 단일 시트 정렬).
describe('emitCss — cross-file ordering is input-order independent', () => {
    const pos = (css: string, needle: string) => {
        const i = css.indexOf(needle);
        expect(i, needle).toBeGreaterThan(-1);
        return i;
    };

    it('@media override from a later file lands after the base rule from an earlier file', () => {
        const base = rule({ property: 'padding-top', value: '16px' });
        const media = rule({
            property: 'padding-top',
            value: '8px',
            selectorContext: '@media(max-width:768px)',
        });
        for (const order of [
            [base, media],
            [media, base],
        ]) {
            const css = emitCss(order).cssText;
            expect(pos(css, 'padding-top: 16px')).toBeLessThan(
                pos(css, '@media (max-width: 768px)'),
            );
        }
    });

    it(':hover from one file beats base from another regardless of order', () => {
        const base = rule({ property: 'color', value: 'red' });
        const hover = rule({ property: 'color', value: 'blue', selectorContext: ':hover' });
        for (const order of [
            [base, hover],
            [hover, base],
        ]) {
            const css = emitCss(order).cssText;
            expect(pos(css, 'color: red')).toBeLessThan(pos(css, ':hover'));
        }
    });

    it('longhand beats shorthand regardless of order', () => {
        const short = rule({ property: 'border', value: '1px solid' });
        const long = rule({ property: 'border-top-color', value: 'red' });
        for (const order of [
            [short, long],
            [long, short],
        ]) {
            const css = emitCss(order).cssText;
            expect(pos(css, 'border: 1px solid')).toBeLessThan(pos(css, 'border-top-color: red'));
        }
    });

    it('max-width media queries are emitted widest first', () => {
        const w1024 = rule({
            property: 'color',
            value: 'a',
            selectorContext: '@media(max-width:1024px)',
        });
        const w768 = rule({
            property: 'color',
            value: 'b',
            selectorContext: '@media(max-width:768px)',
        });
        for (const order of [
            [w1024, w768],
            [w768, w1024],
        ]) {
            const css = emitCss(order).cssText;
            expect(pos(css, '(max-width: 1024px)')).toBeLessThan(pos(css, '(max-width: 768px)'));
        }
    });

    it('identical rules across files dedupe to one class', () => {
        const a = rule({ property: 'color', value: 'red' });
        const out = emitCss([a, { ...a }]);
        expect(out.classNamesPerRule[0]).toBe(out.classNamesPerRule[1]);
        expect(out.cssText.match(/color: red/g)).toHaveLength(1);
    });
});
