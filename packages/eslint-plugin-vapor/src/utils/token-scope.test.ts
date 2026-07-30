import { describe, expect, it } from 'vitest';

import { scopeFromTokenName } from './token-scope';

describe('scopeFromTokenName', () => {
    it('returns foreground for semantic foreground tokens', () => {
        expect(scopeFromTokenName('--vapor-color-foreground-primary-100')).toBe('foreground');
    });
    it('returns background for semantic background tokens', () => {
        expect(scopeFromTokenName('--vapor-color-background-secondary-100')).toBe('background');
    });
    it('returns border for semantic border tokens', () => {
        expect(scopeFromTokenName('--vapor-color-border-primary-100')).toBe('border');
    });
    it('returns primitive for primitive color tokens', () => {
        expect(scopeFromTokenName('--vapor-color-blue-600')).toBe('primitive');
    });
    it('returns dimension for size-dimension tokens', () => {
        expect(scopeFromTokenName('--vapor-size-dimension-150')).toBe('dimension');
    });
    it('returns space for size-space tokens', () => {
        expect(scopeFromTokenName('--vapor-size-space-200')).toBe('space');
    });
    it('returns borderRadius for size-borderRadius tokens', () => {
        expect(scopeFromTokenName('--vapor-size-borderRadius-300')).toBe('borderRadius');
    });
    it('returns shadow for shadow tokens', () => {
        expect(scopeFromTokenName('--vapor-shadow-md')).toBe('shadow');
    });
    it('returns null for non-vapor tokens', () => {
        expect(scopeFromTokenName('--my-token')).toBe(null);
    });
    it('returns null for unknown vapor segments', () => {
        expect(scopeFromTokenName('--vapor-foo-bar')).toBe(null);
    });
});
