import turboConfig from 'eslint-config-turbo/flat';

export const config = [
    ...turboConfig,
    {
        rules: {
            'turbo/no-undeclared-env-vars': 'error',
        },
    },
];
