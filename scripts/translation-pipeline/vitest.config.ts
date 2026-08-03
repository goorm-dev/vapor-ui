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
        include: ['src/**/*.test.ts', 'tests/**/*.test.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html', 'lcov'],
            include: ['src/**/*.ts'],
            exclude: ['src/cli.ts', 'src/run.ts', 'src/input.ts', 'src/output.ts'],
            thresholds: {
                lines: 70,
                branches: 65,
                functions: 70,
                statements: 70,
            },
        },
    },
});
