import { configs } from '@repo/eslint-config/base';

export default [
    ...configs,
    {
        ignores: ['dist', 'node_modules', 'build', 'coverage', '**/__testfixtures__/**'],
    },
];
