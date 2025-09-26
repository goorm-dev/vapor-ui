import { defineConfig } from 'tsup';

export default [
    // ESM, CJS
    defineConfig({
        entryPoints: ['src/index.ts'],
        format: ['esm', 'cjs'],
        target: 'es6', // Final build output is transpiled to ES6 for legacy browser compatibility
        outDir: 'dist',
        minify: true,
        treeshake: true,
        sourcemap: true,
        cjsInterop: true,
    }),

    // TYPES
    defineConfig({
        entryPoints: ['src/index.ts'],
        format: ['cjs', 'esm'],
        splitting: true,
        sourcemap: true,
        clean: true,
        dts: { only: true },
        outDir: 'dist/types',
    }),
];
