import { createGlobalVar } from '@vanilla-extract/css';

export const SCALE_FACTOR_VAR_NAME = 'vapor-scale-factor';
export const RADIUS_FACTOR_VAR_NAME = 'vapor-radius-factor';

export const INITIAL_SCALE_FACTOR = '1';
export const INITIAL_RADIUS_FACTOR = '1';

/**
 * For Modern browsers
 */
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
