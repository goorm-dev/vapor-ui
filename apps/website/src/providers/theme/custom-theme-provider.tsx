'use client';

import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useState } from 'react';

import type { SemanticMappingConfig } from '@vapor-ui/color-generator';
import { generateCompleteCSS } from '@vapor-ui/css-generator';
import type { CompleteCSSConfig, RadiusKey } from '@vapor-ui/css-generator';

/* -------------------------------------------------------------------------------------------------
 * Constants
 * -----------------------------------------------------------------------------------------------*/

const DYNAMIC_THEME_STYLE_ID = 'vapor-custom-theme';
export const RADIUS_VALUES: RadiusKey[] = ['none', 'sm', 'md', 'lg', 'xl', 'full'];
export const SCALE_VALUES = [0.8, 0.9, 1, 1.2, 1.5] as const;

const DEFAULT_COLORS: SemanticMappingConfig = {
    primary: {
        name: 'primary',
        color: '#3174dc',
    },
    background: {
        name: 'neutral',
        color: '#ffffff',
        lightness: {
            light: 100,
            dark: 0,
        },
    },
};

const DEFAULT_SCALING = 1;
const DEFAULT_RADIUS: RadiusKey = 'md';

/* -------------------------------------------------------------------------------------------------
 * Types
 * -----------------------------------------------------------------------------------------------*/

export type RadiusValue = RadiusKey;
export type ScaleValue = (typeof SCALE_VALUES)[number];

export interface CustomThemeConfig {
    colors?: SemanticMappingConfig;
    scaling?: number;
    radius?: RadiusKey;
}

interface CustomThemeContextValue {
    applyTheme: (partialConfig: CustomThemeConfig) => void;
    applyColors: (colors: SemanticMappingConfig) => void;
    applyScaling: (scaling: number) => void;
    applyRadius: (radius: RadiusKey) => void;
    removeTheme: () => void;
    currentConfig: Partial<CompleteCSSConfig>;
}

/* -------------------------------------------------------------------------------------------------
 * Utilities
 * -----------------------------------------------------------------------------------------------*/

/**
 * DOM에 동적 스타일을 주입하는 유틸리티 함수
 * @param css - 주입할 CSS 문자열
 */
const injectDynamicStyle = (css: string): void => {
    const existingStyle = document.getElementById(DYNAMIC_THEME_STYLE_ID);
    if (existingStyle) {
        existingStyle.textContent = css;
        return;
    }

    const styleElement = document.createElement('style');
    styleElement.id = DYNAMIC_THEME_STYLE_ID;
    styleElement.textContent = css;
    document.head.appendChild(styleElement);
};

/**
 * DOM에서 동적 스타일을 제거하는 유틸리티 함수
 */
const removeDynamicStyle = (): void => {
    const existingStyle = document.getElementById(DYNAMIC_THEME_STYLE_ID);
    existingStyle?.remove();
};

/**
 * CSS 변수에 !important 플래그를 추가하는 유틸리티 함수
 * @param css - 원본 CSS 문자열
 * @returns !important가 추가된 CSS 문자열
 */
const addImportantFlags = (css: string): string => {
    return css
        .replace(/(--vapor-scale-factor:\s*[^;]+)/g, '$1 !important')
        .replace(/(--vapor-radius-factor:\s*[^;]+)/g, '$1 !important');
};

/* -------------------------------------------------------------------------------------------------
 * Context & Provider
 * -----------------------------------------------------------------------------------------------*/

const CustomThemeContext = createContext<CustomThemeContextValue | null>(null);

interface CustomThemeProviderProps {
    children: ReactNode;
}

export const CustomThemeProvider = ({ children }: CustomThemeProviderProps) => {
    const [currentConfig, setCurrentConfig] = useState<Partial<CompleteCSSConfig>>({});

    const applyTheme = useCallback((partialConfig: CustomThemeConfig) => {
        setCurrentConfig((prevConfig) => {
            const updatedConfig = { ...prevConfig, ...partialConfig };

            const completeConfig: CompleteCSSConfig = {
                colors: updatedConfig.colors ?? DEFAULT_COLORS,
                scaling: updatedConfig.scaling ?? DEFAULT_SCALING,
                radius: updatedConfig.radius ?? DEFAULT_RADIUS,
            };

            const generatedCSS = generateCompleteCSS(completeConfig);
            const cssWithImportant = addImportantFlags(generatedCSS);
            injectDynamicStyle(cssWithImportant);

            return updatedConfig;
        });
    }, []);

    const applyColors = useCallback(
        (colors: SemanticMappingConfig) => applyTheme({ colors }),
        [applyTheme],
    );

    const applyScaling = useCallback((scaling: number) => applyTheme({ scaling }), [applyTheme]);

    const applyRadius = useCallback((radius: RadiusKey) => applyTheme({ radius }), [applyTheme]);

    const removeTheme = useCallback(() => {
        removeDynamicStyle();
        setCurrentConfig({});
    }, []);

    const value: CustomThemeContextValue = {
        applyTheme,
        applyColors,
        applyScaling,
        applyRadius,
        removeTheme,
        currentConfig,
    };

    return <CustomThemeContext.Provider value={value}>{children}</CustomThemeContext.Provider>;
};

/* -------------------------------------------------------------------------------------------------
 * Hooks
 * -----------------------------------------------------------------------------------------------*/

export const useCustomTheme = (): CustomThemeContextValue => {
    const context = useContext(CustomThemeContext);
    if (!context) {
        throw new Error('useCustomTheme must be used within CustomThemeProvider');
    }
    return context;
};
