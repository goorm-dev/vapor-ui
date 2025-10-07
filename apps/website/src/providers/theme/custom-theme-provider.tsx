'use client';

import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useState } from 'react';

import type { SemanticMappingConfig } from '@vapor-ui/color-generator';
import { generateColorCSS, generateRadiusCSS, generateScalingCSS } from '@vapor-ui/css-generator';
import type { CompleteCSSConfig, RadiusKey } from '@vapor-ui/css-generator';

/* -------------------------------------------------------------------------------------------------
 * Constants
 * -----------------------------------------------------------------------------------------------*/

const DYNAMIC_THEME_STYLE_ID = 'vapor-custom-theme';
export const RADIUS_VALUES: RadiusKey[] = ['none', 'sm', 'md', 'lg', 'xl', 'full'];
export const SCALE_VALUES = [0.8, 0.9, 1, 1.1, 1.2] as const;

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
 * 각 CSS 타입별 저장소
 */
interface GeneratedCSSStore {
    colors?: string;
    scaling?: string;
    radius?: string;
}

/**
 * DOM에 동적 스타일을 주입하는 유틸리티 함수
 * @param cssStore - CSS 타입별 문자열 객체
 */
const injectDynamicStyle = (cssStore: GeneratedCSSStore): void => {
    const cssArray: string[] = [];

    if (cssStore.colors) cssArray.push(cssStore.colors);
    if (cssStore.scaling) cssArray.push(cssStore.scaling);
    if (cssStore.radius) cssArray.push(cssStore.radius);

    const mergedCSS = mergeCSSRules(cssArray);
    const cssWithImportant = addImportantFlags(mergedCSS);

    const existingStyle = document.getElementById(DYNAMIC_THEME_STYLE_ID);
    if (existingStyle) {
        existingStyle.textContent = cssWithImportant;
        return;
    }

    const styleElement = document.createElement('style');
    styleElement.id = DYNAMIC_THEME_STYLE_ID;
    styleElement.textContent = cssWithImportant;
    document.head.appendChild(styleElement);
};

/**
 * 여러 CSS 규칙을 병합하는 함수
 * @param cssArray - CSS 문자열 배열
 * @returns 병합된 CSS 문자열
 */
const mergeCSSRules = (cssArray: string[]): string => {
    if (cssArray.length === 0) return '';

    const properties: string[] = [];
    const otherRules: string[] = [];

    cssArray.forEach((css) => {
        const rootMatch = css.match(/:root\s*\{([^}]+)\}/);
        if (rootMatch) {
            const props = rootMatch[1]
                .split(';')
                .map((p) => p.trim())
                .filter((p) => p.length > 0);
            properties.push(...props);
        }

        const withoutRoot = css.replace(/:root\s*\{[^}]+\}/g, '').trim();
        if (withoutRoot) {
            otherRules.push(withoutRoot);
        }
    });

    const rootRule = `:root {\n  ${properties.join(';\n  ')};\n}`;

    return [rootRule, ...otherRules].filter(Boolean).join('\n\n');
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
    const [_generatedCSS, setGeneratedCSS] = useState<GeneratedCSSStore>({});

    const applyTheme = useCallback((partialConfig: CustomThemeConfig) => {
        setCurrentConfig((prevConfig) => {
            const updatedConfig = { ...prevConfig, ...partialConfig };
            return updatedConfig;
        });

        setGeneratedCSS((prevCSS) => {
            const newCSS: GeneratedCSSStore = { ...prevCSS };

            if (partialConfig.colors) {
                const colorCSS = generateColorCSS(partialConfig.colors);
                newCSS.colors = colorCSS;
            }

            if (partialConfig.scaling !== undefined) {
                const scalingCSS = generateScalingCSS(partialConfig.scaling);
                newCSS.scaling = scalingCSS;
            }

            if (partialConfig.radius !== undefined) {
                const radiusCSS = generateRadiusCSS(partialConfig.radius);
                newCSS.radius = radiusCSS;
            }

            injectDynamicStyle(newCSS);

            return newCSS;
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
        setGeneratedCSS({});
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
