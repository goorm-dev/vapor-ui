import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    resolve: {
        alias: {
            '~': path.resolve(__dirname, './src'),
        },
    },
    test: {
        globals: true,
        environment: 'node',
        include: ['test/**/*.test.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html', 'lcov'],
            include: ['src/**/*.ts'],

            exclude: [
                'src/index.ts',
                'src/bin/**',
                'src/cli/**',
                'src/output/writer.ts',
                'src/types/**',
            ],

            thresholds: {
                lines: 70,
                branches: 65,
                functions: 70,
                statements: 70,
            },
        },
    },
});
