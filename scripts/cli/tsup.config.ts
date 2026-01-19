import { defineConfig } from 'tsup';

export default [
    defineConfig({
        entry: ['src/index.ts'],
        format: ['cjs', 'esm'],
        clean: true,
        shims: true,
    }),

    defineConfig({
        entry: ['src/index.ts'],
        format: ['esm'],
        dts: { only: true },
        clean: true,
    }),
];
