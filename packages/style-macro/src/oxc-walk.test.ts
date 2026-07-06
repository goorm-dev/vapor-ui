/* eslint-disable @typescript-eslint/no-explicit-any */
import { parseSync } from 'oxc-parser';
import { describe, expect, it } from 'vitest';

import { walk } from './oxc-walk';

describe('walk', () => {
    it('visits nested nodes post-order', () => {
        const source = 'f(g(1), h(2));';
        const ast = parseSync('t.ts', source, { sourceType: 'module', lang: 'ts' });
        const order: string[] = [];
        walk(ast.program, {
            CallExpression: (node: any) => {
                order.push((node.callee as any).name);
            },
        });
        expect(order).toEqual(['g', 'h', 'f']);
    });

    it('exposes the parent node to visitors', () => {
        const source = 'const x = { a: 1 };';
        const ast = parseSync('t.ts', source, { sourceType: 'module', lang: 'ts' });
        const parents: string[] = [];
        walk(ast.program, {
            Property: (_node: any, parent: any) => {
                parents.push(parent.type);
            },
        });
        expect(parents).toEqual(['ObjectExpression']);
    });

    it('ignores non-node values in arrays', () => {
        const source = 'const a = [1, , 3];';
        const ast = parseSync('t.ts', source, { sourceType: 'module', lang: 'ts' });
        let count = 0;
        walk(ast.program, {
            Literal: () => {
                count += 1;
            },
        });
        expect(count).toBe(2);
    });
});
