// @ts-check
import { configs as basePackage } from '@repo/eslint-config/base';

export default [
    ...basePackage,
    {
        files: ['src/**/*.ts'],
        languageOptions: {
            parserOptions: {
                project: './tsconfig.json',
            },
        },
        rules: {
            // Figma plugin specific rules
            'no-console': 'warn',
            '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        },
    },
    {
        ignores: ['dist/**/*', 'build.mjs'],
    },
];
