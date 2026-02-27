// @ts-check
import { importX } from 'eslint-plugin-import-x';

import { rules } from './libs/import-rule.js';
import { settings } from './libs/import-setting.js';

/**
 * @description https://github.com/typescript-eslint/typescript-eslint/issues/10935 If this issue closed, we can remove any type.
 * @type {Record<string, any>} */
export const plugins = { import: importX };

export { rules };

export { settings };

/** @type {import('eslint').Linter.Config} */
export const config = {
    plugins,
    settings,
    rules,
};
