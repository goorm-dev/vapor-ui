import { createGlobalThemeContract, createGlobalVar } from '@vanilla-extract/css';

import {
    INITIAL_RADIUS_FACTOR,
    INITIAL_SCALE_FACTOR,
    RADIUS_FACTOR_VAR_NAME,
    SCALE_FACTOR_VAR_NAME,
    THEME_TOKENS,
} from './constants';

export const vars = createGlobalThemeContract(THEME_TOKENS, (_, path) => `vapor-${path.join('-')}`);

export const scaleFactorVar = createGlobalVar(SCALE_FACTOR_VAR_NAME, {
    syntax: '<number>',
    inherits: true,
    initialValue: INITIAL_SCALE_FACTOR,
});
export const radiusFactorVar = createGlobalVar(RADIUS_FACTOR_VAR_NAME, {
    syntax: '<number>',
    inherits: true,
    initialValue: INITIAL_RADIUS_FACTOR,
});
