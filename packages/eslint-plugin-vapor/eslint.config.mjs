import { configs as base } from '@repo/eslint-config/base';
import { config as imports } from '@repo/eslint-config/import';

export default [{ ignores: ['dist', 'node_modules'] }, ...base, imports];
