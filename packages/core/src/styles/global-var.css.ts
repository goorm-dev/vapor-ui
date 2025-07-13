import { createGlobalVar } from '@vanilla-extract/css';

export const SCALE_FACTOR_VAR_NAME = 'vapor-scale-factor';
export const RADIUS_FACTOR_VAR_NAME = 'vapor-radius-factor';

export const scaleFactorVar = createGlobalVar(SCALE_FACTOR_VAR_NAME, {
    syntax: '<number>',
    inherits: true,
    initialValue: '1',
});
export const radiusFactorVar = createGlobalVar(RADIUS_FACTOR_VAR_NAME, {
    syntax: '<number>',
    inherits: true,
    initialValue: '1',
});
