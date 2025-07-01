import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    plugins: [react(), vanillaExtractPlugin()],
    resolve: {
        alias: {
            '~': path.resolve(__dirname, 'src'),
        },
    },
    test: {
        setupFiles: ['./__tests__/setup-tests.ts'],
        environment: 'happy-dom',
        exclude: ['node_modules', 'dist'],
        include: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}'],
        globals: true,
        coverage: {
            provider: 'v8',
            include: ['src/components/**/*.tsx'],
            exclude: ['src/**/*.stories.tsx', 'src/styles/*'],
        },
    },
});
