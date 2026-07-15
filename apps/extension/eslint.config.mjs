// @ts-check
import { configs as reactPackage } from '@repo/eslint-config/react-package';

import wxtAutoImports from './.wxt/eslint-auto-imports.mjs';

export default [
    ...reactPackage,
    wxtAutoImports,
    {
        ignores: ['.output/**', '.wxt/**'],
    },
];
