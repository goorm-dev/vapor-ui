import { describe, expect, it } from 'vitest';

import { expandShorthand } from './shorthand';

describe('expandShorthand', () => {
    it('expands single-value padding to all four sides', () => {
        expect(expandShorthand('padding', '8px')).toEqual([
            { property: 'padding-top', value: '8px' },
            { property: 'padding-right', value: '8px' },
            { property: 'padding-bottom', value: '8px' },
            { property: 'padding-left', value: '8px' },
        ]);
    });

    it('expands two-value padding to block / inline (CSS 1-to-4 rule)', () => {
        expect(expandShorthand('padding', '8px 16px')).toEqual([
            { property: 'padding-top', value: '8px' },
            { property: 'padding-right', value: '16px' },
            { property: 'padding-bottom', value: '8px' },
            { property: 'padding-left', value: '16px' },
        ]);
    });

    it('expands three-value padding (top / inline / bottom)', () => {
        expect(expandShorthand('padding', '8px 16px 24px')).toEqual([
            { property: 'padding-top', value: '8px' },
            { property: 'padding-right', value: '16px' },
            { property: 'padding-bottom', value: '24px' },
            { property: 'padding-left', value: '16px' },
        ]);
    });

    it('expands four-value padding', () => {
        expect(expandShorthand('padding', '1px 2px 3px 4px')).toEqual([
            { property: 'padding-top', value: '1px' },
            { property: 'padding-right', value: '2px' },
            { property: 'padding-bottom', value: '3px' },
            { property: 'padding-left', value: '4px' },
        ]);
    });

    it('does not split inside var() / calc() parens', () => {
        expect(expandShorthand('padding', 'var(--a) var(--b)')).toEqual([
            { property: 'padding-top', value: 'var(--a)' },
            { property: 'padding-right', value: 'var(--b)' },
            { property: 'padding-bottom', value: 'var(--a)' },
            { property: 'padding-left', value: 'var(--b)' },
        ]);
        expect(expandShorthand('padding', 'calc(1px + 2px) 2px')).toEqual([
            { property: 'padding-top', value: 'calc(1px + 2px)' },
            { property: 'padding-right', value: '2px' },
            { property: 'padding-bottom', value: 'calc(1px + 2px)' },
            { property: 'padding-left', value: '2px' },
        ]);
    });

    it('expands two-value margin', () => {
        expect(expandShorthand('margin', '8px 16px')).toEqual([
            { property: 'margin-top', value: '8px' },
            { property: 'margin-right', value: '16px' },
            { property: 'margin-bottom', value: '8px' },
            { property: 'margin-left', value: '16px' },
        ]);
    });

    it('expands two-value padding-inline (start/end)', () => {
        expect(expandShorthand('padding-inline', '8px 16px')).toEqual([
            { property: 'padding-inline-start', value: '8px' },
            { property: 'padding-inline-end', value: '16px' },
        ]);
    });

    it('expands single-value padding-inline to both sides', () => {
        expect(expandShorthand('padding-inline', '8px')).toEqual([
            { property: 'padding-inline-start', value: '8px' },
            { property: 'padding-inline-end', value: '8px' },
        ]);
    });

    it('expands border-radius with corner order (TL/TR/BR/BL)', () => {
        expect(expandShorthand('border-radius', '2px 4px')).toEqual([
            { property: 'border-top-left-radius', value: '2px' },
            { property: 'border-top-right-radius', value: '4px' },
            { property: 'border-bottom-right-radius', value: '2px' },
            { property: 'border-bottom-left-radius', value: '4px' },
        ]);
    });

    it('passes through dynamic single-value (var(--slot-X)) untouched', () => {
        expect(expandShorthand('padding', 'var(--slot-abc)')).toEqual([
            { property: 'padding-top', value: 'var(--slot-abc)' },
            { property: 'padding-right', value: 'var(--slot-abc)' },
            { property: 'padding-bottom', value: 'var(--slot-abc)' },
            { property: 'padding-left', value: 'var(--slot-abc)' },
        ]);
    });

    it('passes through non-shorthand property unchanged', () => {
        expect(expandShorthand('color', 'red')).toEqual([{ property: 'color', value: 'red' }]);
    });
});
