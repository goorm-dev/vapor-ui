import { ecmaVersion } from './libs/constants.js';
import { rules } from './libs/ts-rule.js';
import tseslint from 'typescript-eslint';

/** @type {import('eslint').Linter.LanguageOptions} */
export const languageOptions = {
    sourceType: 'module',
    ecmaVersion,
    parser: tseslint.parser,
    parserOptions: {
        warnOnUnsupportedTypeScriptVersion: true,
        ecmaVersion,
    },
};

/** @type {Record<string, import('eslint').ESLint.Plugin>} */
export const plugins = {
    '@typescript-eslint': tseslint.plugin,
};

export { rules };

/** @type {string[]} */
export const files = ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts'];

/** @type {import('eslint').Linter.Config} */
export const config = {
    files,
    languageOptions,
    plugins,
    rules,
};
