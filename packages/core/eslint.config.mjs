// @ts-check
import { configs as reactPackage } from '@repo/eslint-config/react-package';
import { configs as storybook } from '@repo/eslint-config/storybook';
import { configs as vanillaExtract } from '@repo/eslint-config/vanilla-extract';

/** @type {import('eslint').Linter.Config[]} */
export default [
    ...reactPackage,
    ...storybook,
    ...vanillaExtract,
    {
        settings: {
            'vanilla-extract': {
                style: ['componentStyle'],
                recipe: ['componentRecipe'],
            },
        },
    },
    {
        files: ['**/*.tsx'],
        ignores: ['**/*.*.tsx'],
        rules: {
            'jsx-a11y/anchor-has-content': 'off',
        },
    },
];
