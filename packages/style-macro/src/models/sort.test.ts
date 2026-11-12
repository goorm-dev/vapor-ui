import { describe, expect, it } from 'vitest';

import { bucketOf, bucketRank, compareAtRulePath, compareAtRuleUnit } from './sort';

describe('bucketOf', () => {
    it('shorthand depth < longhand < pseudo (LVFHA) < at-rule', () => {
        const ranks = [
            bucketOf('base', false, 'border'),
            bucketOf('base', false, 'border-top'),
            bucketOf('base', false, 'border-top-color'),
            bucketOf(':link', false, 'color'),
            bucketOf(':visited', false, 'color'),
            bucketOf(':focus-within', false, 'color'),
            bucketOf(':focus', false, 'color'),
            bucketOf(':focus-visible', false, 'color'),
            bucketOf(':hover', false, 'color'),
            bucketOf(':active', false, 'color'),
            bucketOf('base', true, 'color'),
        ].map(bucketRank);
        for (let i = 1; i < ranks.length; i++) expect(ranks[i]).toBeGreaterThan(ranks[i - 1]);
    });

    it('attribute / self-ref / pseudo-element selectors stay in base', () => {
        expect(bucketOf('[data-active]', false, 'color')).toBe('base');
        expect(bucketOf('&.on', false, 'color')).toBe('base');
        expect(bucketOf('::before', false, 'content')).toBe('base');
    });

    it('pseudo inside at-rule goes to the at bucket', () => {
        expect(bucketOf(':hover', true, 'color')).toBe('at');
    });
});

describe('compareAtRuleUnit', () => {
    const sorted = (units: string[]) => units.slice().sort(compareAtRuleUnit);

    it('min-width ascending (mobile-first)', () => {
        expect(
            sorted([
                '@media (min-width: 1024px)',
                '@media (min-width: 480px)',
                '@media (min-width: 768px)',
            ]),
        ).toEqual([
            '@media (min-width: 480px)',
            '@media (min-width: 768px)',
            '@media (min-width: 1024px)',
        ]);
    });

    it('max-width descending, after min-width', () => {
        expect(
            sorted([
                '@media (max-width: 768px)',
                '@media (max-width: 1024px)',
                '@media (min-width: 480px)',
            ]),
        ).toEqual([
            '@media (min-width: 480px)',
            '@media (max-width: 1024px)',
            '@media (max-width: 768px)',
        ]);
    });

    it('range syntax is normalised with legacy syntax', () => {
        expect(sorted(['@media (width <= 768px)', '@media (max-width: 1024px)'])).toEqual([
            '@media (max-width: 1024px)',
            '@media (width <= 768px)',
        ]);
    });

    it('fewer conditions first; unparsable preludes before parsable ones', () => {
        expect(
            sorted([
                '@media (min-width: 768px) and (max-width: 1024px)',
                '@media (min-width: 768px)',
                '@media print',
            ]),
        ).toEqual([
            '@media print',
            '@media (min-width: 768px)',
            '@media (min-width: 768px) and (max-width: 1024px)',
        ]);
    });

    it('at-rule name alphabetical: @container < @media < @supports', () => {
        expect(
            sorted([
                '@supports (display: grid)',
                '@media (min-width: 1px)',
                '@container (min-width: 1px)',
            ]),
        ).toEqual([
            '@container (min-width: 1px)',
            '@media (min-width: 1px)',
            '@supports (display: grid)',
        ]);
    });

    it('em/rem are compared in px', () => {
        expect(sorted(['@media (min-width: 50em)', '@media (min-width: 700px)'])).toEqual([
            '@media (min-width: 700px)',
            '@media (min-width: 50em)',
        ]);
    });
});

describe('compareAtRulePath', () => {
    it('shorter path first when prefixes are equal', () => {
        expect(
            compareAtRulePath(
                ['@media (min-width: 1px)'],
                ['@media (min-width: 1px)', '@supports (x)'],
            ),
        ).toBeLessThan(0);
    });
});
