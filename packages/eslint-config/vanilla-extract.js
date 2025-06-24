// @ts-check
import { WARN } from './libs/constants.js';
import vanillaExtract from '@antebudimir/eslint-plugin-vanilla-extract';

/** @type {Record<string, import('eslint').ESLint.Plugin>} */
// @ts-ignore
const plugins = { 'vanilla-extract': vanillaExtract };

/** @type {import('eslint').Linter.Config} */
const vanillaExtractConfig = { plugins };

/** @type {import("eslint").Linter.Config[]} */
export const configs = [
    vanillaExtractConfig,
    {
        files: ['**/*.css.ts'],
        rules: { 'vanilla-extract/concentric-order': WARN },
    },
];
