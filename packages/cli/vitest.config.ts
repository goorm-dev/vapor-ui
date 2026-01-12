import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    plugins: [],
    resolve: {
        alias: {
            '~': path.resolve(__dirname, 'src'),
        },
    },
    test: {
        exclude: ['node_modules', 'dist'],
        include: ['src/**/*.{test,spec}.{ts,tsx}'],
        globals: true,
        coverage: {
            provider: 'v8',
            include: ['src/**/*.{ts,tsx}'],
            exclude: ['src/index.mjs', 'src/index.ts'],
        },
    },
});
