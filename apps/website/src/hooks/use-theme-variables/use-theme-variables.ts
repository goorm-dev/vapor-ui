import { useCallback } from 'react';

/* -------------------------------------------------------------------------------------------------
 * Constants & Types
 * -----------------------------------------------------------------------------------------------*/

const RADIUS_VALUES = ['none', 'sm', 'md', 'lg', 'xl', 'full'] as const;
const SCALE_VALUES = ['0.8', '0.9', '1', '1.15', '1.2'] as const;

type ThemeVariableType = 'radius' | 'scale';
type RadiusValue = (typeof RADIUS_VALUES)[number];
type ScaleValue = (typeof SCALE_VALUES)[number];

const THEME_VARIABLE_MAP = {
    radius: '--vapor-radius-factor',
    scale: '--vapor-scale-factor',
} as const;

/* -------------------------------------------------------------------------------------------------
 * Helpers
 * -----------------------------------------------------------------------------------------------*/

const getRadiusFactor = (value: RadiusValue): number => {
    switch (value) {
        case 'none':
            return 0;
        case 'sm':
            return 0.5;
        case 'md':
            return 1;
        case 'lg':
            return 1.5;
        case 'xl':
            return 2;
        case 'full':
            return 3;
        default:
            return 1;
    }
};

const getVariableValue = (type: ThemeVariableType, value: string): string => {
    if (type === 'radius') {
        return getRadiusFactor(value as RadiusValue).toString();
    }
    return value;
};

/* -------------------------------------------------------------------------------------------------
 * Hook
 * -----------------------------------------------------------------------------------------------*/

const useThemeVariables = () => {
    const setThemeVariable = useCallback((type: ThemeVariableType, value: string) => {
        const cssVariable = THEME_VARIABLE_MAP[type];
        const processedValue = getVariableValue(type, value);
        document.documentElement.style.setProperty(cssVariable, processedValue);
    }, []);

    return { setThemeVariable };
};

export type { ThemeVariableType, RadiusValue, ScaleValue };
export { RADIUS_VALUES, SCALE_VALUES, useThemeVariables };
