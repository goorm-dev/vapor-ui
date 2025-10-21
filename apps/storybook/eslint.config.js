// @ts-check
import { configs as reactPackage } from '@repo/eslint-config/react-package';
import { configs as storybook } from '@repo/eslint-config/storybook';

export default [...reactPackage, ...storybook];
