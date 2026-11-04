import { describe, expect, it } from 'vitest';

import { _mergeStyles, _mkStyle, _toClass } from './mk-style';

describe('_mkStyle', () => {
    it('returns an object whose toString joins atomic classNames by space', () => {
        const x = _mkStyle({ 'padding-top': 'pt-16', 'padding-right': 'pr-16' });
        expect(String(x)).toBe('pt-16 pr-16');
    });

    it('is usable in a template literal (React path)', () => {
        const x = _mkStyle({ color: 'c-1' });
        expect(`${x}`).toBe('c-1');
    });

    it('empty map → empty string', () => {
        const x = _mkStyle({});
        expect(String(x)).toBe('');
    });

    it('skips empty-string values in toString output', () => {
        const x = _mkStyle({ 'padding-top': 'pt-16', 'padding-right': '' });
        expect(String(x)).toBe('pt-16');
    });
});

describe('_mergeStyles', () => {
    it('later argument wins per property key (StyleX convention)', () => {
        const a = _mkStyle({ 'padding-top': 'pt-16', 'padding-right': 'pr-16' });
        const b = _mkStyle({ 'padding-top': 'pt-32' });
        const merged = _mergeStyles(a, b);
        expect(String(merged)).toContain('pt-32');
        expect(String(merged)).toContain('pr-16');
        expect(String(merged)).not.toContain('pt-16');
    });

    it('result is itself a VaporClass (can re-merge)', () => {
        const a = _mkStyle({ color: 'c-1' });
        const b = _mkStyle({ background: 'bg-1' });
        const once = _mergeStyles(a, b);
        const twice = _mergeStyles(once, _mkStyle({ color: 'c-2' }));
        expect(String(twice)).toContain('c-2');
        expect(String(twice)).toContain('bg-1');
        expect(String(twice)).not.toContain('c-1');
    });

    it('silently ignores non-VaporClass inputs (plain string / undefined)', () => {
        const a = _mkStyle({ color: 'c-1' });
        const merged = _mergeStyles(a, 'plain-string', undefined, null);
        expect(String(merged)).toBe('c-1');
    });

    it('zero arguments → empty VaporClass', () => {
        const merged = _mergeStyles();
        expect(String(merged)).toBe('');
    });
});

describe('_toClass', () => {
    it('VaporClass → joined string', () => {
        const x = _mkStyle({ 'padding-top': 'pt-16' });
        expect(_toClass(x)).toBe('pt-16');
    });

    it('undefined / null → empty string', () => {
        expect(_toClass(undefined)).toBe('');
        expect(_toClass(null)).toBe('');
    });

    it('plain string → fallback String() conversion', () => {
        expect(_toClass('extra-class')).toBe('extra-class');
    });
});

describe('Symbol tag', () => {
    it('is not enumerable — for-in only sees property-key entries', () => {
        const x = _mkStyle({ 'padding-top': 'pt-16' });
        const keys: string[] = [];
        for (const k in x as unknown as Record<string, unknown>) keys.push(k);
        expect(keys).toEqual(['padding-top']);
    });
});
