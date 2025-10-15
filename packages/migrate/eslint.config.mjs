import { configs } from '@repo/eslint-config/base';

export default [
    ...configs,
    {
        excludedFiles: [
            '**/dist/**',
            '**/node_modules/**',
            '**/build/**',
            '**/coverage/**',
            '**/__textfixtures__/**',
        ],
    },
];
