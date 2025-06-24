// @ts-check
import { configs as reactPackage } from '@repo/eslint-config/react-package';
import { configs as vanillaExtract } from '@repo/eslint-config/vanilla-extract';

export default [...reactPackage, ...vanillaExtract];
