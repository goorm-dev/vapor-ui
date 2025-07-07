import { calc } from '@vanilla-extract/css-utils';

import { scaleFactorVar } from '~/styles/vars.css';

export const DIMENSION = {
    '025': calc.multiply(scaleFactorVar, '2px'),
    '050': calc.multiply(scaleFactorVar, '4px'),
    '075': calc.multiply(scaleFactorVar, '6px'),
    '100': calc.multiply(scaleFactorVar, '8px'),
    '150': calc.multiply(scaleFactorVar, '12px'),
    '175': calc.multiply(scaleFactorVar, '14px'),
    '200': calc.multiply(scaleFactorVar, '16px'),
    '225': calc.multiply(scaleFactorVar, '18px'),
    '250': calc.multiply(scaleFactorVar, '20px'),
    '300': calc.multiply(scaleFactorVar, '24px'),
    '400': calc.multiply(scaleFactorVar, '32px'),
    '500': calc.multiply(scaleFactorVar, '40px'),
    '600': calc.multiply(scaleFactorVar, '48px'),
    '700': calc.multiply(scaleFactorVar, '56px'),
    '800': calc.multiply(scaleFactorVar, '64px'),
};
