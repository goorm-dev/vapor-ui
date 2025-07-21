import { defineConfig } from 'tsup';

const commonConfig = {
    dts: true,
    splitting: false,
    sourcemap: true,
    outExtension({ format }) {
        return {
            js: format === 'esm' ? '.js' : '.cjs',
        };
    },
};

export default defineConfig([
    {
        entry: ['src/index.ts'],
        format: ['esm', 'cjs'],
        outDir: 'dist',
        ...commonConfig,
    },
    {
        entry: ['src/vite/index.ts'],
        format: ['esm', 'cjs'],
        outDir: 'dist/vite',
        ...commonConfig,
    },
    {
        entry: ['src/postcss/index.ts'],
        format: ['cjs'],
        outDir: 'dist/postcss',
        tsconfig: 'src/postcss/tsconfig.json',
        ...commonConfig,
    },
]);
