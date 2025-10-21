import { calc } from '@vanilla-extract/css-utils';

import { scaleFactorVar } from '~/styles/variable.css';

export const LINE_HEIGHT = {
    '025': calc.multiply(scaleFactorVar, '14px'),
    '050': calc.multiply(scaleFactorVar, '18px'),
    '075': calc.multiply(scaleFactorVar, '22px'),
    '100': calc.multiply(scaleFactorVar, '24px'),
    '200': calc.multiply(scaleFactorVar, '26px'),
    '300': calc.multiply(scaleFactorVar, '30px'),
    '400': calc.multiply(scaleFactorVar, '36px'),
    '500': calc.multiply(scaleFactorVar, '48px'),
    '600': calc.multiply(scaleFactorVar, '56px'),
    '700': calc.multiply(scaleFactorVar, '62px'),
    '800': calc.multiply(scaleFactorVar, '84px'),
    '900': calc.multiply(scaleFactorVar, '104px'),
    '1000': calc.multiply(scaleFactorVar, '156px'),
};
