import { parseSync } from 'oxc-parser';
import { describe, expect, it } from 'vitest';

import { parseCallArgs } from './parse-call';
import type { ManifestShape } from './types';
import { validateInput } from './validate-input';

const manifest: ManifestShape = {
    version: '1',
    tokens: {
        color: { primary: '--vapor-color-primary' },
        space: { '400': '--vapor-size-space-400', '600': '--vapor-size-space-600' },
        dimension: {},
        borderRadius: {},
        shadow: {},
        typography: {},
    },
    propertyScopes: {
        padding: 'space',
        color: 'color',
    },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function callArg(src: string): any {
    const ast = parseSync('t.ts', `$style(${src})`, { sourceType: 'module', lang: 'ts' });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const expr = (ast.program.body[0] as any).expression as any;
    return expr.arguments[0];
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
