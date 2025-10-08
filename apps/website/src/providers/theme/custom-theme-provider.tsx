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

interface GeneratedCSSStore {
    colors?: string;
    scaling?: string;
    radius?: string;
}

const injectDynamicStyle = (cssStore: GeneratedCSSStore): void => {
    const cssArray = Object.values(cssStore).filter(Boolean) as string[];
    const mergedCSS = mergeCSSRules(cssArray);
    const cssWithImportant = addImportantFlags(mergedCSS);

    let styleElement = document.getElementById(DYNAMIC_THEME_STYLE_ID) as HTMLStyleElement;

    if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = DYNAMIC_THEME_STYLE_ID;
        document.head.appendChild(styleElement);
    }

    styleElement.textContent = cssWithImportant;
};

const mergeCSSRules = (cssArray: string[]): string => {
    if (cssArray.length === 0) return '';

    const lightThemeProperties: string[] = [];
    const otherRules: string[] = [];

    cssArray.forEach((css) => {
        const lightThemeMatch = css.match(/:root,\s*\[data-vapor-theme=light\]\s*\{([^}]+)\}/);
        if (lightThemeMatch) {
            const props = lightThemeMatch[1]
                .split(';')
                .map((p) => p.trim())
                .filter(Boolean);
            lightThemeProperties.push(...props);
        }

        const withoutLightTheme = css
            .replace(/:root,\s*\[data-vapor-theme=light\]\s*\{[^}]+\}/g, '')
            .trim();
        if (withoutLightTheme) {
            otherRules.push(withoutLightTheme);
        }
    });

    const lightThemeRule =
        lightThemeProperties.length > 0
            ? `:root, [data-vapor-theme=light] {\n  ${lightThemeProperties.join(';\n  ')};\n}`
            : '';

    return [lightThemeRule, ...otherRules].filter(Boolean).join('\n\n');
};

const removeDynamicStyle = (): void => {
    const existingStyle = document.getElementById(DYNAMIC_THEME_STYLE_ID);
    existingStyle?.remove();
};

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
        setCurrentConfig((prev) => ({ ...prev, ...partialConfig }));

        setGeneratedCSS((prev) => {
            const updated: GeneratedCSSStore = { ...prev };

            if (partialConfig.colors) {
                updated.colors = generateColorCSS(partialConfig.colors);
            }

            if (partialConfig.scaling !== undefined) {
                updated.scaling = generateScalingCSS(partialConfig.scaling);
            }

            if (partialConfig.radius !== undefined) {
                updated.radius = generateRadiusCSS(partialConfig.radius);
            }

            injectDynamicStyle(updated);
            return updated;
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

    return (
        <CustomThemeContext.Provider
            value={{
                applyTheme,
                applyColors,
                applyScaling,
                applyRadius,
                removeTheme,
                currentConfig,
            }}
        >
            {children}
        </CustomThemeContext.Provider>
    );
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
