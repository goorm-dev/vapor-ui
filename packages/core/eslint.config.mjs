// @ts-check
import { configs as reactPackage } from '@repo/eslint-config/react-package';
import { configs as storybook } from '@repo/eslint-config/storybook';
import { configs as vanillaExtract } from '@repo/eslint-config/vanilla-extract';

export default [
    ...reactPackage,
    ...vanillaExtract,
    ...storybook,
    {
        files: ['**/*.tsx'],
        ignores: ['**/*.*.tsx'],
        rules: {
            'jsx-a11y/anchor-has-content': 'off',
        },
    },
];
