import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    plugins: [],
    resolve: {
        alias: {
            '~': path.resolve(__dirname, 'src'),
        },
    },
    ssr: {
        noExternal: ['@vapor-ui/icons', '@vapor-ui/core'],
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
