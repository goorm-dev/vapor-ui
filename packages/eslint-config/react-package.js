// @ts-check
import storybook from 'eslint-plugin-storybook';

import * as imports from './import.js';
import * as base from './index.js';
import * as react from './react.js';

/** @type {import("eslint").Linter.Config[]} */
export const configs = [
    base.js,
    base.ts,
    react.config,
    imports.config,
    base.overrides,
    {
        rules: {
            'react/jsx-pascal-case': ['warn', { allowNamespace: true }],
            // TODO: enable this and fix all the errors
            'react/display-name': 'off',
            'jsx-a11y/label-has-associated-control': [
                'warn',
                {
                    controlComponents: ['Checkbox'],
                    depth: 3,
                },
            ],
        },
    },
    ...storybook.configs['flat/recommended'],
];
