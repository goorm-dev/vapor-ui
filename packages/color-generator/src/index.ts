import { generateColorPalette } from './primitive';
import { generateSemanticColorPalette } from './semantic';

// ============================================================================
// Primitive Colors
// ============================================================================

export { generateColorPalette, DEFAULT_PRIMITIVE_COLORS } from './primitive';
export const colorPalette = generateColorPalette();

// ============================================================================
// Semantic Colors
// ============================================================================

export { generateSemanticColorPalette, type SemanticColorConfig } from './semantic';
export const primaryColorPalette = generateSemanticColorPalette({
    colors: {
        primary: '#ffffdc',
    },
});

// ============================================================================
// Core Constants & Types
// ============================================================================
export { DEFAULT_CONTRAST_RATIOS, DEFAULT_MAIN_BACKGROUND_LIGHTNESS } from './core';
export type { ThemeType, ColorToken, ColorPaletteCollection, ColorGeneratorConfig } from './core';
