import { formatCSS, createCSSVariable, type CSSRule } from '../utils';

interface ScalingCSSOptions {
    prefix?: string;
    format?: 'compact' | 'readable';
}

const DEFAULT_PREFIX = 'vapor';

export const generateScalingCSS = (
    scaling: number,
    options: ScalingCSSOptions = {}
): string => {
    const { prefix = DEFAULT_PREFIX, format = 'readable' } = options;
    
    if (typeof scaling !== 'number' || scaling <= 0) {
        throw new Error('Scaling factor must be a positive number');
    }
    
    const scalingVariable = createCSSVariable(`${prefix}-scale-factor`, scaling.toString());
    
    const rule: CSSRule = {
        selector: ':root',
        properties: [scalingVariable],
    };
    
    return formatCSS([rule], format);
};