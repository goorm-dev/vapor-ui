/* eslint-disable @typescript-eslint/no-explicit-any */
import { parseSync } from 'oxc-parser';
import { describe, expect, it } from 'vitest';

import { parseLayerProp } from './parse-layer-prop';

const REGISTRY = {
    theme: 'vapor-theme',
    reset: 'vapor-reset',
    components: 'vapor-components',
    utilities: 'vapor-utilities',
};

function exprFromSource(src: string): any {
    const ast = parseSync('t.ts', `const _ = ${src};`, { sourceType: 'module', lang: 'ts' });
    const stmt = ast.program.body[0] as any;
    if (stmt.type !== 'VariableDeclaration') throw new Error('unreachable');
    const decl = stmt.declarations[0];
    if (!decl.init) throw new Error('unreachable');
    return decl.init;
}

describe('parseLayerProp', () => {
    it('accepts a plain array of string literals', () => {
        const expr = exprFromSource(`['vapor-theme', 'my.tw', 'vapor-utilities']`);
        const r = parseLayerProp(expr, REGISTRY);
        expect(r.errors).toEqual([]);
        expect(r.order).toEqual(['vapor-theme', 'my.tw', 'vapor-utilities']);
    });

    it('accepts an arrow function returning an array', () => {
        const expr = exprFromSource(
            `(l) => [l.theme, l.reset, 'tw-utils', l.components, l.utilities]`,
        );
        const r = parseLayerProp(expr, REGISTRY);
        expect(r.errors).toEqual([]);
        expect(r.order).toEqual([
            'vapor-theme',
            'vapor-reset',
            'tw-utils',
            'vapor-components',
            'vapor-utilities',
        ]);
    });

    it('accepts a block-body arrow with a return statement', () => {
        const expr = exprFromSource(`(l) => { return [l.theme, l.utilities]; }`);
        const r = parseLayerProp(expr, REGISTRY);
        expect(r.errors).toEqual([]);
        expect(r.order).toEqual(['vapor-theme', 'vapor-utilities']);
    });

    it('accepts an arrow with no parameter', () => {
        const expr = exprFromSource(`() => ['vapor-theme', 'vapor-utilities']`);
        const r = parseLayerProp(expr, REGISTRY);
        expect(r.errors).toEqual([]);
        expect(r.order).toEqual(['vapor-theme', 'vapor-utilities']);
    });

    it('rejects an identifier reference (dynamic)', () => {
        const expr = exprFromSource(`someLayers`);
        const r = parseLayerProp(expr, REGISTRY);
        expect(r.errors.length).toBe(1);
        expect(r.errors[0].code).toBe('layer-non-static');
    });

    it('rejects arrays with template literals', () => {
        // eslint-disable-next-line no-template-curly-in-string
        const expr = exprFromSource('[`vapor.${which}`]');
        const r = parseLayerProp(expr, REGISTRY);
        expect(r.errors.length).toBe(1);
        expect(r.errors[0].code).toBe('layer-non-static');
    });

    it('rejects arrays with spread', () => {
        const expr = exprFromSource(`[...others, 'vapor-utilities']`);
        const r = parseLayerProp(expr, REGISTRY);
        expect(r.errors.length).toBeGreaterThan(0);
        expect(r.errors[0].code).toBe('layer-non-static');
    });

    it('rejects member access to an unknown registry key', () => {
        const expr = exprFromSource(`(l) => [l.theme, l.bogus]`);
        const r = parseLayerProp(expr, REGISTRY);
        expect(r.errors.length).toBe(1);
        expect(r.errors[0].code).toBe('layer-unknown-registry-key');
    });

    it('rejects member access to a wrong parameter name', () => {
        // `l.theme` won't match when the arrow param is `other`
        const expr = exprFromSource(`(other) => [l.theme]`);
        const r = parseLayerProp(expr, REGISTRY);
        expect(r.errors.length).toBe(1);
        expect(r.errors[0].code).toBe('layer-non-static');
    });

    it('rejects destructured arrow parameter', () => {
        const expr = exprFromSource(`({ theme }) => [theme]`);
        const r = parseLayerProp(expr, REGISTRY);
        expect(r.errors.length).toBe(1);
        expect(r.errors[0].code).toBe('layer-non-static');
    });

    it('rejects a block-body arrow that does more than return', () => {
        const expr = exprFromSource(`(l) => { const arr = [l.theme]; return arr; }`);
        const r = parseLayerProp(expr, REGISTRY);
        expect(r.errors.length).toBe(1);
        expect(r.errors[0].code).toBe('layer-non-static');
    });
});
