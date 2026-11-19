import { describe, expect, it } from 'vitest';

import { _mergeStyle, _withStyle } from './merge-style';

const slots = { '--s': 'red' };

describe('_mergeStyle', () => {
    it('returns the slots when the element has no style', () => {
        expect(_mergeStyle(slots, undefined)).toEqual(slots);
        expect(_mergeStyle(slots, null)).toEqual(slots);
    });

    it('lets the user style win key by key over the slots', () => {
        expect(_mergeStyle(slots, { '--s': 'blue', color: 'green' })).toEqual({
            '--s': 'blue',
            color: 'green',
        });
    });

    it('wraps a stateful style callback and merges its result', () => {
        const merged = _mergeStyle(slots, (state: { on: boolean }) => ({
            opacity: state.on ? 1 : 0,
        }));
        expect(typeof merged).toBe('function');
        expect((merged as (s: { on: boolean }) => object)({ on: true })).toEqual({
            '--s': 'red',
            opacity: 1,
        });
    });

    it('keeps the slots when the callback returns nothing', () => {
        const merged = _mergeStyle(slots, () => undefined) as () => object;
        expect(merged()).toEqual(slots);
    });
});

describe('_withStyle', () => {
    it('merges the slots into the final style of the props object', () => {
        const props = { id: 'a', style: { color: 'green' } };
        expect(_withStyle(slots, props)).toEqual({
            id: 'a',
            style: { '--s': 'red', color: 'green' },
        });
        expect(props).toEqual({ id: 'a', style: { color: 'green' } });
    });

    it('adds the slots when no attribute carried a style', () => {
        const props: { id: string; style?: undefined } = { id: 'a' };
        expect(_withStyle(slots, props)).toEqual({ id: 'a', style: slots });
    });
});
