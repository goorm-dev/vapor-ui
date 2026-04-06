import { cn } from './cn';

describe('cn', () => {
    it('merges multiple static className values', () => {
        expect(cn('base', 'user', 'extra')).toBe('base user extra');
    });

    it('returns only base className when user className is missing', () => {
        expect(cn('base')).toBe('base');
    });

    it('returns a resolver when className is a function', () => {
        const resolver = cn<{ active: boolean }>('base', (state) =>
            state.active ? 'is-active' : 'is-inactive',
        );

        expect(typeof resolver).toBe('function');
        if (typeof resolver === 'function') {
            expect(resolver({ active: true })).toBe('base is-active');
            expect(resolver({ active: false })).toBe('base is-inactive');
        }
    });

    it('filters falsy values from className function result', () => {
        const resolver = cn<{ active: boolean }>('base', (state) => (state.active ? 'x' : ''));

        expect(typeof resolver).toBe('function');

        if (typeof resolver === 'function') {
            expect(resolver({ active: false })).toBe('base');
        }
    });

    it('supports mixed static and function className values', () => {
        const resolver = cn<{ active: boolean }>(
            'base',
            'always',
            (state) => (state.active ? 'is-active' : ''),
            'tail',
        );

        expect(typeof resolver).toBe('function');

        if (typeof resolver === 'function') {
            expect(resolver({ active: true })).toBe('base always is-active tail');
            expect(resolver({ active: false })).toBe('base always tail');
        }
    });
});
