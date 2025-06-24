import { ERROR, OFF } from './constants.js';

/** @type {Partial<import('eslint').Linter.RulesRecord>} */
export const rules = {
    'react/display-name': ERROR,
    'react/forbid-foreign-prop-types': [ERROR, { allowInPropTypes: true }],
    'react/jsx-key': ERROR,
    'react/jsx-no-comment-textnodes': ERROR,
    'react/jsx-no-target-blank': ERROR,
    'react/jsx-no-undef': ERROR,
    'react/jsx-pascal-case': [ERROR, { allowAllCaps: true, ignore: [] }],
    'react/jsx-uses-vars': ERROR,
    'react/jsx-uses-react': ERROR,
    'react/no-danger-with-children': ERROR,
    'react/no-deprecated': ERROR,
    'react/no-direct-mutation-state': ERROR,
    'react/no-find-dom-node': ERROR,
    'react/no-is-mounted': ERROR,
    'react/no-render-return-value': ERROR,
    'react/no-string-refs': ERROR,
    'react/no-typos': ERROR,
    'react/react-in-jsx-scope': OFF,
    'react/require-render-return': OFF,
    'react/style-prop-object': ERROR,

    // react-hooks
    // https://github.com/facebook/react/tree/main/packages/eslint-plugin-react-hooks
    'react-hooks/exhaustive-deps': ERROR,
    'react-hooks/rules-of-hooks': ERROR,
};
