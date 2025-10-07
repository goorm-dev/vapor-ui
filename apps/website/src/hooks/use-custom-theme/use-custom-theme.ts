import { useCallback, useState } from 'react';

import type { SemanticMappingConfig } from '@vapor-ui/color-generator';
import { generateCompleteCSS } from '@vapor-ui/css-generator';
import type { CompleteCSSConfig, RadiusKey } from '@vapor-ui/css-generator';

const DYNAMIC_THEME_STYLE_ID = 'vapor-custom-theme';
const RADIUS_VALUES: RadiusKey[] = ['none', 'sm', 'md', 'lg', 'xl', 'full'];
const SCALE_VALUES = ['0.8', '0.9', '1', '1.15', '1.2'] as const;

type RadiusValue = RadiusKey;
type ScaleValue = (typeof SCALE_VALUES)[number];

interface CustomThemeConfig {
    colors?: SemanticMappingConfig;
    scaling?: number;
    radius?: RadiusKey;
}

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

const useCustomTheme = () => {
    const [currentConfig, setCurrentConfig] = useState<Partial<CompleteCSSConfig>>({});

    const applyTheme = useCallback(
        (partialConfig: CustomThemeConfig) => {
            const updatedConfig = { ...currentConfig, ...partialConfig };

            const completeConfig: CompleteCSSConfig = {
                colors: updatedConfig.colors || DEFAULT_COLORS,
                scaling: updatedConfig.scaling ?? DEFAULT_SCALING,
                radius: updatedConfig.radius || DEFAULT_RADIUS,
            };

            const generatedCSS = generateCompleteCSS(completeConfig);

            const cssWithImportant = generatedCSS
                .replace(/(--vapor-scale-factor:\s*[^;]+)/g, '$1 !important')
                .replace(/(--vapor-radius-factor:\s*[^;]+)/g, '$1 !important');

            const existingStyle = document.getElementById(DYNAMIC_THEME_STYLE_ID);
            if (existingStyle) {
                existingStyle.remove();
            }

            const styleElement = document.createElement('style');
            styleElement.id = DYNAMIC_THEME_STYLE_ID;
            styleElement.textContent = cssWithImportant;
            document.head.appendChild(styleElement);

            setCurrentConfig(completeConfig);
        },
        [currentConfig],
    );

    const applyColors = useCallback(
        (colors: SemanticMappingConfig) => {
            applyTheme({ colors });
        },
        [applyTheme],
    );

    const applyScaling = useCallback(
        (scaling: number) => {
            applyTheme({ scaling });
        },
        [applyTheme],
    );

    const applyRadius = useCallback(
        (radius: RadiusKey) => {
            applyTheme({ radius });
        },
        [applyTheme],
    );

    const removeTheme = useCallback(() => {
        const existingStyle = document.getElementById(DYNAMIC_THEME_STYLE_ID);
        if (existingStyle) {
            existingStyle.remove();
        }
        setCurrentConfig({});
    }, []);

    return {
        applyTheme,
        applyColors,
        applyScaling,
        applyRadius,
        removeTheme,
        currentConfig,
    };
};

export { RADIUS_VALUES, SCALE_VALUES, useCustomTheme };
export type { RadiusValue, ScaleValue, CustomThemeConfig };
