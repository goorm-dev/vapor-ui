import { configs } from '@repo/eslint-config/base';

export default [
    ...configs,
    {
        ignores: ['dist', 'node_modules', 'coverage', 'src/__fixtures__'],
    },
];
