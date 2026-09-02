import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/bin.ts'],
    format: ['esm'],
    target: 'node20',
    outDir: 'dist',
    clean: true,
    sourcemap: true,
    splitting: false,
    dts: false,
    banner: { js: '#!/usr/bin/env node' },
});
