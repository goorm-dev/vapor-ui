// @ts-check
import globals from 'globals';

import { ecmaVersion } from './libs/constants.js';
import rules from './libs/core-rule.js';

export { rules };

/** @type {string[]} */
export const files = [
    '**/*.js',
    '**/*.jsx',
    '**/*.mjs',
    '**/*.cjs',
    '**/*.ts',
    '**/*.tsx',
    '**/*.mts',
    '**/*.cts',
];

/**
 * @type {import('eslint').Linter.LanguageOptions}
 * @deprecated
 */
export const languageOptions = {
    sourceType: 'module',
    ecmaVersion,
    globals: globals.browser,
    parserOptions: {
        ecmaFeatures: {
            jsx: true,
        },
    },
};

/**
 * @type {import('eslint').Linter.Config}
 * @deprecated
 */
export const config = {
    files,
    languageOptions,
    rules,
};

/**
 * @param {import('eslint').Linter.Globals} [globals]
 * @returns {import('eslint').Linter.LanguageOptions}
 */
export function getLanguageOptions(globals) {
    return {
        sourceType: 'module',
        ecmaVersion,
        globals,
        parserOptions: {
            ecmaFeatures: {
                jsx: true,
            },
        },
    };
}

/**
 * @param {import('eslint').Linter.Globals} [globals]
 * @returns {import('eslint').Linter.Config}
 */
export function getConfig(globals) {
    return {
        files,
        languageOptions: getLanguageOptions(globals),
        rules,
    };
}
