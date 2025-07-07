import { calc } from '@vanilla-extract/css-utils';

import { radiusFactorVar } from '~/styles/vars.css';

export const BORDER_RADIUS = {
    '000': calc.multiply(radiusFactorVar, '0px'),
    '050': calc.multiply(radiusFactorVar, '2px'),
    '100': calc.multiply(radiusFactorVar, '4px'),
    '200': calc.multiply(radiusFactorVar, '6px'),
    '300': calc.multiply(radiusFactorVar, '8px'),
    '400': calc.multiply(radiusFactorVar, '12px'),
    '500': calc.multiply(radiusFactorVar, '16px'),
    '600': calc.multiply(radiusFactorVar, '20px'),
    '700': calc.multiply(radiusFactorVar, '24px'),
    '800': calc.multiply(radiusFactorVar, '32px'),
    '900': calc.multiply(radiusFactorVar, '40px'),
};
