import { describe, expect, it } from 'vitest';

import { CliError, parseCliArgs } from '~/cli/run';

describe('parseCliArgs', () => {
    it('returns input and output when both are provided', () => {
        const result = parseCliArgs(['--input', './en', '--output', './out']);
        expect(result).toEqual({ input: './en', output: './out', verbose: false });
    });

    it('throws CliError when --input is missing', () => {
        expect(() => parseCliArgs(['--output', './out'])).toThrow(CliError);
        expect(() => parseCliArgs(['--output', './out'])).toThrow(/--input/);
    });

    it('throws CliError when --output is missing', () => {
        expect(() => parseCliArgs(['--input', './en'])).toThrow(CliError);
        expect(() => parseCliArgs(['--input', './en'])).toThrow(/--output/);
    });

    it('honors --verbose flag', () => {
        const result = parseCliArgs(['-i', './en', '-o', './out', '--verbose']);
        expect(result.verbose).toBe(true);
    });
});
