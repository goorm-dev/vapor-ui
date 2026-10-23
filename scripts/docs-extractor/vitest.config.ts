import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        include: ['test/**/*.test.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html', 'lcov'],
            include: ['src/**/*.ts'],

            exclude: ['src/cli.ts'],

            thresholds: {
                lines: 70,
                branches: 65,
                functions: 70,
                statements: 70,
            },
        },
    },
});
