/**
 * Config unit tests
 */
import { validatePartialConfig } from '~/config/schema';

describe('validatePartialConfig', () => {
    it('accepts known fields', () => {
        expect(() =>
            validatePartialConfig({
                inputPath: './src',
                outputDir: './out',
                include: ['className'],
                verbose: true,
            }),
        ).not.toThrow();
    });

    it('rejects non-string inputPath', () => {
        expect(() => validatePartialConfig({ inputPath: 42 as never })).toThrow(/inputPath/);
    });

    it('rejects non-string-array include', () => {
        expect(() => validatePartialConfig({ include: ['ok', 1 as never] })).toThrow(/include/);
    });
});
