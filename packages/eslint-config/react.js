import { rules as rulesJsxA11y } from './libs/a11y-jsx-rule.js';
import { rules as rulesReact } from './libs/react-rule.js';
import { settings } from './libs/react-setting.js';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

/** @type {Record<string, import('eslint').ESLint.Plugin>} */
export const plugins = {
    react,
    'react-hooks': reactHooks,
    'jsx-a11y': jsxA11y,
};

export { settings };

/** @type {Partial<import('eslint').Linter.RulesRecord>} */
export const rules = { ...rulesReact, ...rulesJsxA11y };

/** @type {import('eslint').Linter.Config} */
export const config = {
    plugins,
    settings,
    rules,
};
