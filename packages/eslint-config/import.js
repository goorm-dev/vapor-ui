// @ts-check
import { rules } from './libs/import-rule.js';
import { settings } from './libs/import-setting.js';
// @ts-ignore
import imports from 'eslint-plugin-import';

/** @type {Record<string, import('eslint').ESLint.Plugin>} */
export const plugins = { import: imports };

export { rules };

export { settings };

/** @type {import('eslint').Linter.Config} */
export const config = {
    plugins,
    settings,
    rules,
};
