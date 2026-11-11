import { defineConfig } from 'tsup';

export default defineConfig({
    entry: { 'bin/cli': 'src/cli.ts', index: 'src/index.ts' },
    dts: { entry: { index: 'src/index.ts' } },
    format: ['esm'],
    target: 'node22',
    outDir: './dist',
    clean: true,
    sourcemap: false,
    splitting: false,
    minify: false,
    external: ['typescript'],
});
