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

export const primaryColorPalette = generateSemanticColorPalette({ primaryColor: '#FFC107' });
export const semanticColorPalette = generateSemanticColorPalette({
    primaryColor: '#448EFE', // vapor-ui blue
    successColor: '#10B981', // emerald-500
    errorColor: '#EF4444', // red-500
    warningColor: '#F59E0B', // amber-500
    infoColor: '#3B82F6', // blue-500
});

// ============================================================================
// Core Constants & Types
// ============================================================================
export { DEFAULT_CONTRAST_RATIOS, DEFAULT_MAIN_BACKGROUND_LIGHTNESS } from './core';
export type { ThemeType, ColorToken, ColorPaletteCollection, ColorGeneratorConfig } from './core';
