// @ts-check
import vanillaExtract from '@antebudimir/eslint-plugin-vanilla-extract';

import { WARN } from './libs/constants.js';

/** @type {Record<string, import('eslint').ESLint.Plugin>} */
// @ts-ignore
const plugins = { 'vanilla-extract': vanillaExtract };

/** @type {import('eslint').Linter.Config} */
export const config = {
    plugins,
    files: ['**/*.css.ts'],
    rules: { 'vanilla-extract/concentric-order': WARN },
};

/** @type {import("eslint").Linter.Config[]} */
export const configs = [config];
