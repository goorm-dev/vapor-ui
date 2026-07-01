import { describe, expect, it } from 'vitest';

import { parseDeclarationValue } from './css-value-parser';

describe('parseDeclarationValue', () => {
    it('extracts a var() token', () => {
        const ast = {
            type: 'Value',
            children: [
                {
                    type: 'Function',
                    name: 'var',
                    children: [
                        {
                            type: 'Identifier',
                            name: '--vapor-color-foreground-primary-100',
                            loc: { start: { offset: 4 } },
                        },
                    ],
                },
            ],
        };
        const result = parseDeclarationValue(ast);
        expect(result).toEqual([
            { type: 'var', name: '--vapor-color-foreground-primary-100', offset: 4 },
        ]);
    });

    it('extracts hex literal and normalizes shorthand', () => {
        const ast = {
            type: 'Value',
            children: [{ type: 'Hash', value: 'FFF', loc: { start: { offset: 0 } } }],
        };
        expect(parseDeclarationValue(ast)).toEqual([
            { type: 'hex', raw: '#FFF', normalized: '#ffffff', offset: 0 },
        ]);
    });

    it('extracts 4-digit hex and normalizes to 8-digit', () => {
        const ast = {
            type: 'Value',
            children: [{ type: 'Hash', value: 'abcd', loc: { start: { offset: 0 } } }],
        };
        expect(parseDeclarationValue(ast)).toEqual([
            { type: 'hex', raw: '#abcd', normalized: '#aabbccdd', offset: 0 },
        ]);
    });

    it('extracts 8-digit hex', () => {
        const ast = {
            type: 'Value',
            children: [{ type: 'Hash', value: '12345678', loc: { start: { offset: 0 } } }],
        };
        expect(parseDeclarationValue(ast)).toEqual([
            { type: 'hex', raw: '#12345678', normalized: '#12345678', offset: 0 },
        ]);
    });

    it('extracts a px Dimension', () => {
        const ast = {
            type: 'Value',
            children: [
                { type: 'Dimension', value: '12', unit: 'px', loc: { start: { offset: 0 } } },
            ],
        };
        expect(parseDeclarationValue(ast)).toEqual([
            { type: 'dimension', raw: '12px', value: 12, unit: 'px', offset: 0 },
        ]);
    });

    it('ignores rem dimensions (out of scope v1) — but still yields the part for the rule to filter', () => {
        const ast = {
            type: 'Value',
            children: [
                { type: 'Dimension', value: '1', unit: 'rem', loc: { start: { offset: 0 } } },
            ],
        };
        expect(parseDeclarationValue(ast)).toEqual([
            { type: 'dimension', raw: '1rem', value: 1, unit: 'rem', offset: 0 },
        ]);
    });

    it('collects multiple parts from a shorthand', () => {
        const ast = {
            type: 'Value',
            children: [
                { type: 'Dimension', value: '12', unit: 'px', loc: { start: { offset: 0 } } },
                { type: 'Dimension', value: '8', unit: 'px', loc: { start: { offset: 5 } } },
            ],
        };
        expect(parseDeclarationValue(ast)).toHaveLength(2);
    });
});
