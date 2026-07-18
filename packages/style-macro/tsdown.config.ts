import { defineConfig } from 'tsdown';

export default defineConfig({
    format: ['cjs', 'esm'],
    target: ['esnext', 'node18'],
    entry: [
        'src/index.ts',
        'src/adapters/*.ts',
        '!src/adapters/shared.ts',
        '!src/adapters/*.{spec,test,test-d}.*',
    ],
    outputOptions: {
        preserveModules: true,
        preserveModulesRoot: 'src',
    },
    outDir: 'dist',
    minify: false,
    dts: true,
    clean: true,
});
