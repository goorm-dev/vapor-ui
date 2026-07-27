import path from 'node:path';
import { defineConfig } from 'tsup';

export default defineConfig({
    name: 'CLI',
    format: ['esm'],
    sourcemap: true,
    splitting: false,
    target: 'node20',
    esbuildOptions(options) {
        options.alias = {
            '~': path.resolve(__dirname, './src'),
        };
    },
    entry: ['src/cli/index.ts'],
    dts: false,
    outDir: 'dist/cli',
    banner: {
        js: '#!/usr/bin/env node',
    },
});
