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

    it('walks var() fallback content (hex, dimension, nested var)', () => {
        // var(--vapor-color-foreground-primary-100, #fff var(--vapor-color-fallback) 8px)
        // @eslint/css delivers everything after the comma as one Raw node.
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
                        { type: 'Operator', value: ',' },
                        {
                            type: 'Raw',
                            value: ' #fff var(--vapor-color-fallback) 8px',
                            loc: { start: { offset: 43 } },
                        },
                    ],
                },
            ],
        };
        expect(parseDeclarationValue(ast)).toEqual([
            { type: 'var', name: '--vapor-color-foreground-primary-100', offset: 4 },
            { type: 'hex', raw: '#fff', normalized: '#ffffff', offset: 44, inFallback: true },
            { type: 'var', name: '--vapor-color-fallback', offset: 53, inFallback: true },
            { type: 'dimension', raw: '8px', value: 8, unit: 'px', offset: 77, inFallback: true },
        ]);
    });

    // @eslint/css tokenizes var() fallbacks as a single Raw node, not parsed
    // Hash/Dimension/Function children — the parser must re-scan the Raw text.
    it('extracts hex from a Raw fallback node', () => {
        // .x { color: var(--custom-x, #0958c9); }
        // offset 16 = '--custom-x' start, Raw ' #0958c9' starts at 27
        const ast = {
            type: 'Value',
            children: [
                {
                    type: 'Function',
                    name: 'var',
                    children: [
                        { type: 'Identifier', name: '--custom-x', loc: { start: { offset: 16 } } },
                        { type: 'Operator', value: ',' },
                        { type: 'Raw', value: ' #0958c9', loc: { start: { offset: 27 } } },
                    ],
                },
            ],
        };
        expect(parseDeclarationValue(ast)).toEqual([
            { type: 'var', name: '--custom-x', offset: 16 },
            { type: 'hex', raw: '#0958c9', normalized: '#0958c9', offset: 28, inFallback: true },
        ]);
    });

    it('extracts dimension from a Raw fallback node', () => {
        const ast = {
            type: 'Value',
            children: [
                {
                    type: 'Function',
                    name: 'var',
                    children: [
                        { type: 'Identifier', name: '--gap', loc: { start: { offset: 10 } } },
                        { type: 'Operator', value: ',' },
                        { type: 'Raw', value: ' 12px', loc: { start: { offset: 17 } } },
                    ],
                },
            ],
        };
        expect(parseDeclarationValue(ast)).toEqual([
            { type: 'var', name: '--gap', offset: 10 },
            { type: 'dimension', raw: '12px', value: 12, unit: 'px', offset: 18, inFallback: true },
        ]);
    });

    it('extracts nested var() token names from a Raw fallback node', () => {
        const ast = {
            type: 'Value',
            children: [
                {
                    type: 'Function',
                    name: 'var',
                    children: [
                        { type: 'Identifier', name: '--a', loc: { start: { offset: 4 } } },
                        { type: 'Operator', value: ',' },
                        {
                            type: 'Raw',
                            value: ' var(--vapor-color-blue-600, #fff)',
                            loc: { start: { offset: 9 } },
                        },
                    ],
                },
            ],
        };
        expect(parseDeclarationValue(ast)).toEqual([
            { type: 'var', name: '--a', offset: 4 },
            { type: 'var', name: '--vapor-color-blue-600', offset: 14, inFallback: true },
            { type: 'hex', raw: '#fff', normalized: '#ffffff', offset: 38, inFallback: true },
        ]);
    });

    it('does not extract a dimension from a negative number in Raw text', () => {
        // '-8px' must not yield a bare '8px' part — replacing it would corrupt the value
        const ast = {
            type: 'Value',
            children: [
                {
                    type: 'Function',
                    name: 'var',
                    children: [
                        { type: 'Identifier', name: '--m', loc: { start: { offset: 0 } } },
                        { type: 'Operator', value: ',' },
                        { type: 'Raw', value: ' -8px', loc: { start: { offset: 5 } } },
                    ],
                },
            ],
        };
        const parts = parseDeclarationValue(ast);
        const dims = parts.filter((p) => p.type === 'dimension');
        expect(dims).toEqual([
            { type: 'dimension', raw: '-8px', value: -8, unit: 'px', offset: 6, inFallback: true },
        ]);
    });

    it('does not extract digits inside a token name in Raw text as a dimension', () => {
        const ast = {
            type: 'Value',
            children: [
                {
                    type: 'Function',
                    name: 'var',
                    children: [
                        { type: 'Identifier', name: '--a', loc: { start: { offset: 0 } } },
                        { type: 'Operator', value: ',' },
                        {
                            type: 'Raw',
                            value: ' var(--vapor-size-dimension-150)',
                            loc: { start: { offset: 5 } },
                        },
                    ],
                },
            ],
        };
        const parts = parseDeclarationValue(ast);
        expect(parts.filter((p) => p.type === 'dimension')).toEqual([]);
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
