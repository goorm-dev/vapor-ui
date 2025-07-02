import { defineConfig } from 'tsup';

export default [
    // ESM, CJS
    defineConfig({
        entryPoints: ['src/index.ts'],
        format: ['esm', 'cjs'],
        target: 'es6',
        outDir: 'dist',
        sourcemap: true,
        clean: true,
        minify: true,
    }),

    // TYPES
    defineConfig({
        entry: ['src/index.ts'],
        format: ['esm', 'cjs'],
        clean: true,
        dts: { only: true },
        outDir: 'dist',
    }),
];
