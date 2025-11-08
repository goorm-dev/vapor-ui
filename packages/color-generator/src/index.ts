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
    BackgroundLightness,
    ContrastRatios,
    OklchColor,
} from './domain';

// Constants for external use
export {
    DEFAULT_CONTRAST_RATIOS,
    DEFAULT_KEY_COLORS,
    DEFAULT_THEME_OPTIONS,
} from './application/constants';
