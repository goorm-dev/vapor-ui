import { ERROR, OFF } from './constants.js';

/** @type {Partial<import('eslint').Linter.RulesRecord>} */
export const rules = {
    'no-duplicate-imports': OFF,
    'no-undef': OFF,
    'no-redeclare': OFF,

    // Add TypeScript specific rules (and turn off ESLint equivalents)
    '@typescript-eslint/consistent-type-assertions': ERROR,
    '@typescript-eslint/consistent-type-imports': ERROR,

    'no-array-constructor': OFF,
    '@typescript-eslint/no-array-constructor': ERROR,

    'no-use-before-define': OFF,
    '@typescript-eslint/no-use-before-define': [
        ERROR,
        {
            functions: false,
            classes: false,
            variables: false,
            typedefs: false,
        },
    ],
    'no-unused-expressions': OFF,
    '@typescript-eslint/no-unused-expressions': [
        ERROR,
        {
            allowShortCircuit: true,
            allowTernary: true,
            allowTaggedTemplates: true,
        },
    ],
    'no-unused-vars': OFF,
    '@typescript-eslint/no-unused-vars': [
        ERROR,
        {
            args: 'after-used',
            ignoreRestSiblings: false,
            argsIgnorePattern: '^_',
            caughtErrorsIgnorePattern: '^_',
            destructuredArrayIgnorePattern: '^_',
            varsIgnorePattern: '^_',
        },
    ],

    '@typescript-eslint/no-explicit-any': ERROR,

    // https://github.com/typescript-eslint/typescript-eslint/issues/10338#issuecomment-2483750053
    // '@typescript-eslint/no-unsafe-return': ERROR,
    // '@typescript-eslint/no-unsafe-assignment': ERROR,

    // Let TS handle these
    'react/jsx-no-undef': OFF,
    'react/style-prop-object': OFF,
};
