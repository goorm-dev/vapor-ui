import { DEFAULT_PREFIX } from '~/constants';
import type { RadiusKey } from '~/types';

import { type CSSRule, createCSSVariable, formatCSS } from '../utils';

const RADIUS_MAP: Record<RadiusKey, number> = {
    none: 0,
    sm: 0.5,
    md: 1,
    lg: 1.5,
    xl: 2,
    full: 3,
};

interface RadiusCSSOptions {
    prefix?: string;
    format?: 'compact' | 'readable';
}

export const generateRadiusCSS = (radius: RadiusKey, options: RadiusCSSOptions = {}): string => {
    const { prefix = DEFAULT_PREFIX, format = 'readable' } = options;

    const radiusValue = RADIUS_MAP[radius];

    if (radiusValue === undefined) {
        throw new Error(
            `Invalid radius key: ${radius}. Must be one of ${Object.keys(RADIUS_MAP).join(', ')}`,
        );
    }

    const radiusVariable = createCSSVariable(`${prefix}-radius-factor`, String(radiusValue));

    const rule: CSSRule = {
        selector: ':root',
        properties: [radiusVariable],
    };

    return formatCSS([rule], format);
};
