// ===== NEW ARCHITECTURE API =====
// Primary API exports from the new 3-layer architecture
export { generatePrimitiveColorPalette, getSemanticDependentTokens } from './infrastructure';

// Domain types for external use
export type {
    ThemeOptions,
    ThemeResult,
    SemanticResult,
    PrimitiveColorTokens,
    PrimitivePalette,
    PaletteChip,
    BackgroundCanvas,
    SemanticTokens,
    KeyColor,
    BackgroundColor,
    ContrastRatios as NewContrastRatios,
    OklchColor as NewOklchColor,
} from './domain';

// ===== LEGACY API (for backward compatibility) =====
export * from './generators';
export * from './constants';
export type * from './types';
export { getColorLightness } from './utils';
