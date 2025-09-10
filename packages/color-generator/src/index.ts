import { generateColorPalette } from './primitive';
import { generateSemanticColorPalette, generateSemanticDependentTokens } from './semantic';

// ============================================================================
// Primitive Colors
// ============================================================================

export { generateColorPalette, DEFAULT_PRIMITIVE_COLORS } from './primitive';
export const colorPalette = generateColorPalette();

// ============================================================================
// Semantic Colors
// ============================================================================

export { generateSemanticColorPalette } from './semantic';
export const primaryColorPalette = generateSemanticColorPalette({
    colors: {
        primary: '#7c7c00',
    },
});
export const primaryDependentTokens = generateSemanticDependentTokens(primaryColorPalette);

// ============================================================================
// Core Constants & Types
// ============================================================================
export { DEFAULT_CONTRAST_RATIOS, DEFAULT_MAIN_BACKGROUND_LIGHTNESS } from './constants';
export type { ThemeType, ColorToken, ColorPaletteCollection, ColorGeneratorConfig } from './types';
