import { defineConfig } from 'tsup';

export default defineConfig([
    // CLI build - output to dist/bin/
    {
        entry: { 'bin/cli': 'src/bin/cli.ts' },
        format: ['esm'],
        outDir: './dist',
        clean: true,
        sourcemap: false,
        splitting: false,
        minify: false,
        external: ['jscodeshift'],
    },
    // Library build - preserve folder structure in dist/src/
    {
        entry: ['src/index.ts', 'src/transforms/**/*.ts', '!src/**/*.test.ts', '!src/**/*.spec.ts'],
        format: ['esm'],
        outDir: './dist/src',
        clean: false,
        sourcemap: false,
        splitting: false,
        minify: false,
        external: ['jscodeshift'],
    },
]);
