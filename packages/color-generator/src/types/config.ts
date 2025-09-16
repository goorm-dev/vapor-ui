import type { DEFAULT_CONTRAST_RATIOS, DEFAULT_MAIN_BACKGROUND_LIGHTNESS } from '~/constants';

type Colors = Record<string, string>;
type ContrastRatios = Record<keyof typeof DEFAULT_CONTRAST_RATIOS, number>;
type BackgroundLightness = Record<keyof typeof DEFAULT_MAIN_BACKGROUND_LIGHTNESS, number>;
type Background = {
    name: string;
    color: string;
    lightness: BackgroundLightness;
};

interface ColorGeneratorConfig {
    colors?: Colors;
    contrastRatios?: ContrastRatios;
    background?: Background;
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
    background?: Background;
}

/* -----------------------------------------------------------------------------------------------*/

export type {
    Colors,
    ContrastRatios,
    BackgroundLightness,
    Background,
    ColorGeneratorConfig,
    BrandColorGeneratorConfig,
    SemanticMappingConfig,
};
