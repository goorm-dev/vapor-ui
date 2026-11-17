import { parseSync } from 'oxc-parser';
import { describe, expect, it } from 'vitest';

import type { AnyProp } from '~/models/types';

import { walk } from './oxc-walk';
import { isShadowed } from './scope';

/** `/*@*\/name` 표시가 붙은 식별자 참조 위치에서 isShadowed 를 계산한다. */
function shadowedAt(code: string): boolean {
    const marker = code.indexOf('/*@*/');
    const program = parseSync('a.tsx', code, { sourceType: 'module', lang: 'tsx' }).program;
    let result: boolean | null = null;
    walk(program, {
        Identifier: (node: AnyProp, parents: AnyProp[]) => {
            if (node.start === marker + 5) result = isShadowed(node.name, parents);
        },
    });
    if (result === null) throw new Error('marker not found');
    return result;
}

describe('isShadowed', () => {
    it.each([
        ['module scope', `const base = 1; f(/*@*/base);`],
        ['inside a function without a local', `const base = 1; function f() { g(/*@*/base); }`],
        [
            'local in a sibling function',
            `const base = 1; function a() { const base = 2; } function b() { g(/*@*/base); }`,
        ],
        [
            'local in a sibling block',
            `const base = 1; function f() { { const base = 2; } g(/*@*/base); }`,
        ],
        [
            'var in a nested function',
            `const base = 1; function f() { function h() { var base; } g(/*@*/base); }`,
        ],
        [
            'function declaration name used outside',
            `const base = 1; function f() { const x = function base() {}; g(/*@*/base); }`,
        ],
    ])('%s → module binding', (_label, code) => {
        expect(shadowedAt(code)).toBe(false);
    });

    it.each([
        ['parameter', `const base = 1; const f = (base) => g(/*@*/base);`],
        ['destructured parameter', `const base = 1; const f = ({ a: { base } }) => g(/*@*/base);`],
        [
            'default / rest parameter',
            `const base = 1; function f(x = 1, ...base) { g(/*@*/base); }`,
        ],
        [
            'const in enclosing block',
            `const base = 1; function f() { if (x) { const base = 2; g(/*@*/base); } }`,
        ],
        [
            'declared after the reference (TDZ)',
            `const base = 1; function f() { g(/*@*/base); let base = 2; }`,
        ],
        [
            'var hoisted from a nested block',
            `const base = 1; function f() { g(/*@*/base); if (x) { var base = 2; } }`,
        ],
        [
            'nested function declaration in block',
            `const base = 1; function f() { function base() {} g(/*@*/base); }`,
        ],
        ['class declaration in block', `const base = 1; { class base {} g(/*@*/base); }`],
        ['catch parameter', `const base = 1; try {} catch ({ base }) { g(/*@*/base); }`],
        ['for-of binding', `const base = 1; for (const base of xs) g(/*@*/base);`],
        [
            'switch case declaration',
            `const base = 1; switch (x) { case 1: const base = 2; g(/*@*/base); }`,
        ],
        [
            'named function expression',
            `const base = 1; const f = function base() { g(/*@*/base); };`,
        ],
        [
            'class expression name',
            `const base = 1; const C = class base { m() { g(/*@*/base); } };`,
        ],
    ])('%s → shadowed', (_label, code) => {
        expect(shadowedAt(code)).toBe(true);
    });
});
