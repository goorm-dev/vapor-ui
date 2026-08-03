import path from 'node:path';
import { defineConfig } from 'tsup';

// CLI build: ts-api-extractor executable
export default defineConfig({
    format: ['esm'],
    sourcemap: true,
    splitting: false,
    target: 'node20', // matches package.json engines (>=20.19)
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
