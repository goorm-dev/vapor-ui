import { defineConfig } from 'tsup';

export default defineConfig([
    // CLI build - output to dist/cli/
    {
        entry: { 'cli/bin': 'src/cli/bin.ts' },
        format: ['esm'],
        outDir: './dist',
        clean: true,
        sourcemap: false,
        splitting: false,
        minify: false,
    },
]);
