// @ts-check
import { ERROR } from './constants.js';

/** @type {Partial<import('eslint').Linter.RulesRecord>} */
export const rules = {
    'array-callback-return': [ERROR, { checkForEach: true }],
    'no-array-constructor': ERROR,
    'no-cond-assign': [ERROR, 'except-parens'],
    'no-control-regex': ERROR,
    'no-duplicate-imports': ERROR,
    'no-empty-pattern': ERROR,
    'no-empty': [ERROR, { allowEmptyCatch: true }],
    'no-extend-native': ERROR,
    'no-extra-bind': ERROR,
    'no-extra-boolean-cast': ERROR,
    'no-extra-label': ERROR,
    'no-fallthrough': ERROR,
    'no-func-assign': ERROR,
    'no-global-assign': ERROR,
    'no-implied-eval': ERROR,
    'no-label-var': ERROR,
    'no-labels': [ERROR, { allowLoop: true, allowSwitch: false }],
    'no-lone-blocks': ERROR,
    'no-loop-func': ERROR,
    'no-mixed-operators': [
        ERROR,
        {
            groups: [
                ['&', '|', '^', '~', '<<', '>>', '>>>'],
                ['==', '!=', '===', '!==', '>', '>=', '<', '<='],
                ['&&', '||'],
                ['in', 'instanceof'],
            ],
            allowSamePrecedence: false,
        },
    ],
    'no-native-reassign': ERROR,
    'no-new-func': ERROR,
    'no-new-object': ERROR,
    'no-new-wrappers': ERROR,
    'no-octal': ERROR,
    'no-restricted-properties': [
        ERROR,
        // {}
    ],
    'no-restricted-syntax': [ERROR, 'WithStatement'],
    'no-script-url': ERROR,
    'no-self-compare': ERROR,
    'no-sequences': ERROR,
    'no-shadow-restricted-names': ERROR,
    'no-template-curly-in-string': ERROR,
    'no-unused-expressions': [
        ERROR,
        {
            allowShortCircuit: true,
            allowTernary: true,
            allowTaggedTemplates: true,
        },
    ],
    'no-unused-labels': ERROR,
    'no-unused-vars': [
        ERROR,
        {
            args: 'after-used',
            ignoreRestSiblings: true,
            argsIgnorePattern: '^_',
            caughtErrorsIgnorePattern: '^_',
            destructuredArrayIgnorePattern: '^_',
            varsIgnorePattern: '^_',
        },
    ],
    'no-use-before-define': [
        ERROR,
        {
            functions: false,
            classes: false,
            variables: false,
        },
    ],
    'no-useless-computed-key': ERROR,
    'no-useless-concat': ERROR,
    'no-useless-constructor': ERROR,
    'no-useless-escape': ERROR,
    'no-useless-rename': [
        ERROR,
        {
            ignoreDestructuring: false,
            ignoreImport: false,
            ignoreExport: false,
        },
    ],
    'no-with': ERROR,
    'require-yield': ERROR,
};

export default rules;
