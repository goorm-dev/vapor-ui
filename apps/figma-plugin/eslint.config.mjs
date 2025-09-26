// @ts-check
import { configs as reactPackage } from '@repo/eslint-config/react-package';

export default [
  ...reactPackage,
  {
    ignores: ['dist/**/*']
  }
];