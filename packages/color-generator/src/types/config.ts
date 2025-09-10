interface ColorGeneratorConfig {
    colors?: Record<string, string>;
    contrastRatios?: Record<string, number>;
    backgroundLightness?: {
        light: number;
        dark: number;
    };
}

interface BrandColorGeneratorConfig extends ColorGeneratorConfig {
    colors: {
        [colorName: string]: string;
    };
}

interface SemanticMappingConfig {
    primary: { name: string; hex: string };
    secondary?: { name: string; hex: string };
    success?: { name: string; hex: string };
    warning?: { name: string; hex: string };
    error?: { name: string; hex: string };
}

/* -----------------------------------------------------------------------------------------------*/

export type { ColorGeneratorConfig, BrandColorGeneratorConfig, SemanticMappingConfig };
