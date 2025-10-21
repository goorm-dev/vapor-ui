import { calc } from '@vanilla-extract/css-utils';

import { scaleFactorVar } from '~/styles/variables.css';

export const FONT_SIZE = {
    '025': calc.multiply(scaleFactorVar, '10px'),
    '050': calc.multiply(scaleFactorVar, '12px'),
    '075': calc.multiply(scaleFactorVar, '14px'),
    '100': calc.multiply(scaleFactorVar, '16px'),
    '200': calc.multiply(scaleFactorVar, '18px'),
    '300': calc.multiply(scaleFactorVar, '20px'),
    '400': calc.multiply(scaleFactorVar, '24px'),
    '500': calc.multiply(scaleFactorVar, '32px'),
    '600': calc.multiply(scaleFactorVar, '38px'),
    '700': calc.multiply(scaleFactorVar, '48px'),
    '800': calc.multiply(scaleFactorVar, '64px'),
    '900': calc.multiply(scaleFactorVar, '80px'),
    '1000': calc.multiply(scaleFactorVar, '120px'),
};
