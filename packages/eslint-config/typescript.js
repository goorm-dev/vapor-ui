import { ecmaVersion } from './libs/constants.js';
import { rules } from './libs/ts-rule.js';
import tseslintPlugin from '@typescript-eslint/eslint-plugin';
import * as tsselintParser from '@typescript-eslint/parser';

/** @type {import('eslint').Linter.LanguageOptions} */
export const languageOptions = {
    sourceType: 'module',
    ecmaVersion,
    parser: tsselintParser,
    parserOptions: {
        warnOnUnsupportedTypeScriptVersion: true,
        ecmaVersion,
    },
};

/** @type {Record<string, import('eslint').ESLint.Plugin>} */
export const plugins = {
    '@typescript-eslint': tseslintPlugin,
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
