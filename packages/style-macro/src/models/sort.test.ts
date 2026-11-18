import { describe, expect, it } from 'vitest';

import { orderAtRulePaths } from './sort';

/** 작성 순 path 목록 → 출력 순 (첫 unit 만 쓰는 1단계 path). */
const order = (units: string[]) => orderAtRulePaths(units.map((u) => [u])).map((p) => p[0]);

describe('orderAtRulePaths — written order, width media queries of one shape sorted among themselves', () => {
    it('min-width ascending (mobile-first)', () => {
        expect(
            order([
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
            order([
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
        expect(order(['@media (width <= 768px)', '@media (max-width: 1024px)'])).toEqual([
            '@media (max-width: 1024px)',
            '@media (width <= 768px)',
        ]);
    });

    it('em/rem are compared in px', () => {
        expect(order(['@media (min-width: 50em)', '@media (min-width: 700px)'])).toEqual([
            '@media (min-width: 700px)',
            '@media (min-width: 50em)',
        ]);
    });

    it('keeps written order for at-rules that are not width queries', () => {
        const written = [
            '@media (prefers-reduced-motion: no-preference)',
            '@media (hover: hover)',
            '@supports (display: grid)',
            '@container (min-width: 1px)',
            '@media print',
        ];
        expect(order(written)).toEqual(written);
    });

    it('sorts width queries only within their own slots, other at-rules stay in place', () => {
        expect(
            order([
                '@media (min-width: 1024px)',
                '@media (hover: hover)',
                '@media (min-width: 480px)',
            ]),
        ).toEqual([
            '@media (min-width: 480px)',
            '@media (hover: hover)',
            '@media (min-width: 1024px)',
        ]);
    });

    it('compares only queries of the same shape (media type, other features)', () => {
        const written = [
            '@media screen and (min-width: 1024px)',
            '@media (min-width: 480px)',
            '@media (min-width: 900px) and (hover: hover)',
            '@media (min-width: 300px) and (hover: hover)',
        ];
        expect(order(written)).toEqual([
            '@media screen and (min-width: 1024px)',
            '@media (min-width: 480px)',
            '@media (min-width: 300px) and (hover: hover)',
            '@media (min-width: 900px) and (hover: hover)',
        ]);
    });

    it('container queries are not reordered (their width is the container’s, a different axis)', () => {
        const written = ['@container (min-width: 900px)', '@container (min-width: 300px)'];
        expect(order(written)).toEqual(written);
    });

    it('nested paths follow their outermost at-rule; equal outer queries keep written order', () => {
        expect(
            orderAtRulePaths([
                ['@media (min-width: 900px)', '@supports (b)'],
                ['@media (min-width: 300px)'],
                ['@media (min-width: 900px)', '@supports (a)'],
            ]),
        ).toEqual([
            ['@media (min-width: 300px)'],
            ['@media (min-width: 900px)', '@supports (b)'],
            ['@media (min-width: 900px)', '@supports (a)'],
        ]);
    });
});
