// ============================================================================
// Theme & Palette Constants
// ============================================================================

export const DEFAULT_MAIN_BACKGROUND_LIGHTNESS = {
    light: 100,
    dark: 14,
} as const;

export const DEFAULT_CONTRAST_RATIOS = {
    '050': 1.15,
    '100': 1.3,
    '200': 1.7,
    '300': 2.5,
    '400': 3.0,
    '500': 4.5,
    '600': 6.5,
    '700': 8.5,
    '800': 11.5,
    '900': 15.0,
} as const;

// ============================================================================
// Base Color Definitions
// ============================================================================

export const BASE_COLORS = {
    white: {
        hex: '#FFFFFF',
        oklch: 'oklch(1 0 0)',
        codeSyntax: 'vapor-color-white',
    },
    black: {
        hex: '#000000',
        oklch: 'oklch(0 0 0)',
        codeSyntax: 'vapor-color-black',
    },
} as const;

// ============================================================================
// Algorithm Configuration Constants
// ============================================================================

export const ADAPTIVE_COLOR_GENERATION = {
    LIGHTNESS_THRESHOLD: 0.5,
    DARK_LIGHTNESS_FACTOR: 0.55,
    LIGHT_LIGHTNESS_FACTOR: 0.85,
    CHROMA_REDUCTION_FACTOR: 0.85,
} as const;

export const BUTTON_FOREGROUND_LIGHTNESS_THRESHOLD = 0.65;

export const FOREGROUND_TOKEN_NAMES = {
    WHITE: 'color-white',
    BLACK: 'color-black',
} as const;
