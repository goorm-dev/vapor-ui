import * as parser from '@babel/parser';
import * as t from '@babel/types';
import { describe, expect, it } from 'vitest';

import { parseCallArgs } from '../src/parse-call';
import { validateInput } from '../src/validate-input';
import { manifest } from './fixtures/manifest.sample';

function callArg(src: string): t.ObjectExpression {
    const file = parser.parse(`$style(${src})`, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript'],
    });
    const expr = (file.program.body[0] as t.ExpressionStatement).expression as t.CallExpression;
    return expr.arguments[0] as t.ObjectExpression;
}

describe('validateInput', () => {
    it('accepts static literal entry', () => {
        const errors = validateInput(parseCallArgs(callArg(`{ display: 'flex' }`)), manifest);
        expect(errors).toEqual([]);
    });

    it('accepts token entry', () => {
        const errors = validateInput(parseCallArgs(callArg(`{ padding: '$400' }`)), manifest);
        expect(errors).toEqual([]);
    });

    it('accepts named-bp condition object', () => {
        const errors = validateInput(
            parseCallArgs(callArg(`{ padding: { default: '$400', md: '$600' } }`)),
            manifest,
        );
        expect(errors).toEqual([]);
    });

    it('accepts entry-level ternary', () => {
        const errors = validateInput(
            parseCallArgs(callArg(`{ padding: isLarge ? '$600' : '$400' }`)),
            manifest,
        );
        expect(errors).toEqual([]);
    });

    it('rejects spread', () => {
        const errors = validateInput(
            parseCallArgs(callArg(`{ ...base, padding: '$400' }`)),
            manifest,
        );
        expect(errors.map((e) => e.code)).toContain('spread');
    });

    it('rejects computed key', () => {
        const errors = validateInput(parseCallArgs(callArg(`{ [k]: '$400' }`)), manifest);
        expect(errors.map((e) => e.code)).toContain('computed-key');
    });

    it('rejects identifier value', () => {
        const errors = validateInput(parseCallArgs(callArg(`{ padding: foo }`)), manifest);
        expect(errors.map((e) => e.code)).toContain('dynamic-value');
    });

    it('rejects ternary with dynamic arm', () => {
        const errors = validateInput(
            parseCallArgs(callArg(`{ padding: isLarge ? foo : '$400' }`)),
            manifest,
        );
        expect(errors.map((e) => e.code)).toContain('dynamic-value');
    });

    it('rejects ternary nested inside a condition-object', () => {
        const errors = validateInput(
            parseCallArgs(callArg(`{ padding: { default: isLarge ? '$600' : '$400' } }`)),
            manifest,
        );
        expect(errors.map((e) => e.code)).toContain('dynamic-value');
    });

    it('rejects unknown token', () => {
        const errors = validateInput(parseCallArgs(callArg(`{ padding: '$nope' }`)), manifest);
        expect(errors.map((e) => e.code)).toContain('unknown-token');
    });

    it('rejects property-token scope mismatch', () => {
        const errors = validateInput(parseCallArgs(callArg(`{ padding: '$primary' }`)), manifest);
        expect(errors.map((e) => e.code)).toContain('scope-mismatch');
    });
});
