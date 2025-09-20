const DEFAULT_PREFIX = 'vapor';

import { type CSSRule, createCSSVariable, formatCSS } from '../utils';

interface RadiusCSSOptions {
    prefix?: string;
    format?: 'compact' | 'readable';
    unit?: 'px' | 'rem';
}

export const generateRadiusCSS = (radius: number, options: RadiusCSSOptions = {}): string => {
    const { prefix = DEFAULT_PREFIX, format = 'readable', unit = 'px' } = options;

    if (typeof radius !== 'number' || radius < 0) {
        throw new Error('Radius must be a non-negative number');
    }

    const radiusValue = unit === 'rem' ? `${radius / 16}rem` : `${radius}px`;
    const radiusVariable = createCSSVariable(`${prefix}-radius-base`, radiusValue);

    const rule: CSSRule = {
        selector: ':root',
        properties: [radiusVariable],
    };

    return formatCSS([rule], format);
};
