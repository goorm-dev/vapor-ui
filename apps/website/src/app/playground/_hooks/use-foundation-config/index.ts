import { useState } from 'react';

import { DEFAULT_FOUNDATION_CONFIG } from '../../_constants';

interface ThemeConfig {
    primaryColor?: string;
    backgroundColor?: string;
    lightBackgroundLightness?: number;
    darkBackgroundLightness?: number;
    theme?: string;
    borderRadius?: string;
    scaling?: string;
}

const useThemeConfig = () => {
    const [config, setConfig] = useState<ThemeConfig>({
        theme: DEFAULT_FOUNDATION_CONFIG.theme,
        borderRadius: DEFAULT_FOUNDATION_CONFIG.borderRadius,
        scaling: DEFAULT_FOUNDATION_CONFIG.scaling,
    });

    const updateConfig = (key: keyof ThemeConfig, value: string) => {
        setConfig((prev) => ({ ...prev, [key]: value }));
    };

    const generateConfigString = () => {
        return `createThemeConfig({
      theme: "${config.theme}",
      borderRadius: "${config.borderRadius}",
      scaling: "${config.scaling}",
    });`;
    };

    return { config, updateConfig, generateConfigString };
};

export type { ThemeConfig };
export { useThemeConfig };
