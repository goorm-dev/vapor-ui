import { describe, expect, it } from 'vitest';

import { buildClassName } from '~/models/class-name';

import { _ax } from './ax';

const cls = (property: string, value: string, selectorContext = 'base', mode?: 'hashed') =>
    buildClassName({ property, value, rawValue: value, selectorContext }, mode);

describe('_ax', () => {
    it('joins distinct groups in first-seen order', () => {
        const a = cls('padding-top', '8px');
        const b = cls('color', 'red');
        expect(_ax([a, b])).toBe(`${a} ${b}`);
    });

    it('same group (selector + property) → later wins, keeps first position', () => {
        const a = cls('padding-top', '8px');
        const b = cls('padding-top', '16px');
        const c = cls('color', 'red');
        expect(_ax([a, c, b])).toBe(`${b} ${c}`);
    });

    it('different selectorContext is a different group', () => {
        const base = cls('color', 'red');
        const hover = cls('color', 'blue', ':hover');
        expect(_ax([base, hover])).toBe(`${base} ${hover}`);
    });

    it('shorthand and longhand are different groups (cascade decides)', () => {
        const border = cls('border', '1px solid');
        const top = cls('border-top-color', 'red');
        expect(_ax([border, top]).split(' ')).toHaveLength(2);
    });

    it('hashed and readable classes of the same tuple share a group', () => {
        const dev = cls('padding-top', '8px');
        const prod = cls('padding-top', '16px', 'base', 'hashed');
        expect(_ax([dev, prod])).toBe(prod);
    });

    it('splits multi-class strings', () => {
        const a = cls('padding-top', '8px');
        const b = cls('color', 'red');
        const c = cls('padding-top', '16px');
        expect(_ax([`${a} ${b}`, c])).toBe(`${c} ${b}`);
    });

    it('passes non-vapor classes through, deduped by exact name', () => {
        const a = cls('color', 'red');
        expect(_ax(['btn', a, 'btn', 'active'])).toBe(`btn ${a} active`);
    });

    it('ignores falsy parts and extra whitespace', () => {
        const a = cls('color', 'red');
        expect(_ax([null, undefined, false, '', `  ${a}  `])).toBe(a);
    });

    it('empty input → empty string', () => {
        expect(_ax([])).toBe('');
    });
});
