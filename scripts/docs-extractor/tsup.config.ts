import path from 'node:path';
import { defineConfig } from 'tsup';

export default defineConfig([
    // Library build: required for importing defineConfig from apps/website/docs-extractor.config.js
    {
        name: 'LIB',
        format: ['esm'],
        sourcemap: true,
        splitting: false,
        target: 'node20', // matches package.json engines (>=20.19)
        esbuildOptions(options) {
            options.alias = {
                '~': path.resolve(__dirname, './src'),
            };
        },
        entry: ['src/index.ts'],
        dts: true,
        outDir: 'dist',
    },
    // CLI build: ts-api-extractor executable
    {
        name: 'CLI',
        format: ['esm'],
        sourcemap: true,
        splitting: false,
        target: 'node20', // matches package.json engines (>=20.19)
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
