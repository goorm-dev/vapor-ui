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
    },
]);
