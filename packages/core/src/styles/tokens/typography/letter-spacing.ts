import { calc } from '@vanilla-extract/css-utils';

import { scaleFactorVar } from '~/styles/vars.css';

export const LETTER_SPACING = {
    '000': calc.multiply(scaleFactorVar, '0'),
    '100': calc.multiply(scaleFactorVar, '-0.1px'),
    '200': calc.multiply(scaleFactorVar, '-0.2px'),
    '300': calc.multiply(scaleFactorVar, '-0.3px'),
    '400': calc.multiply(scaleFactorVar, '-0.4px'),
};
