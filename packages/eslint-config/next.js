import * as base from './index.js';
import * as react from './react.js';
import next from '@next/eslint-plugin-next';

/** @type {Record<string, import('eslint').ESLint.Plugin>} */
const plugins = {
    ...react.config.plugins,
    '@next/next': next,
};

/** @type {import('eslint').Linter.Config} */
const nextConfig = {
    ...react.config,
    plugins,
};

/** @type {import("eslint").Linter.Config[]} */
export const configs = [
    base.js,
    base.ts,
    base.overrides,
    nextConfig,
    {
        rules: {
            ...next.configs['recommended'].rules,
            ...next.configs['core-web-vitals'].rules,
        },
    },
];
