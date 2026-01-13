import path from 'node:path';
import { defineConfig } from 'tsup';

export default defineConfig([
    {
        format: ['esm'],
        sourcemap: true,
        splitting: false,
        target: 'node18',
        esbuildOptions(options) {
            options.alias = {
                '~': path.resolve(__dirname, './src'),
            };
        },
        entry: ['src/bin/cli.ts'],
        dts: false,
        outDir: 'dist/bin',
        banner: {
            js: '#!/usr/bin/env node',
        },
    },
]);
