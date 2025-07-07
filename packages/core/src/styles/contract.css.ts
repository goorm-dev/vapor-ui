import { createGlobalThemeContract } from '@vanilla-extract/css';

import { THEME_TOKENS } from './constants';

export const vars = createGlobalThemeContract(THEME_TOKENS, (_, path) => `vapor-${path.join('-')}`);
