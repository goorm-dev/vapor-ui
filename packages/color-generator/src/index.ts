/* -------------------------------------------------------------------------------------------------
 * Primitive Colors
 * -----------------------------------------------------------------------------------------------*/

export {
    generateSystemColorPalette,
    generateBrandColorPalette,
    DEFAULT_PRIMITIVE_COLORS,
} from './primitive';
export type { BrandColorGeneratorConfig } from './primitive';

/* -------------------------------------------------------------------------------------------------
 * Semantic Colors
 * -----------------------------------------------------------------------------------------------*/

export { getSemanticDependentTokens } from './semantic';
export type { SemanticMappingConfig } from './semantic';

/* -------------------------------------------------------------------------------------------------
 * Core Constants & Types
 * -----------------------------------------------------------------------------------------------*/
export { DEFAULT_CONTRAST_RATIOS, DEFAULT_MAIN_BACKGROUND_LIGHTNESS } from './constants';
export type { ThemeType, ColorToken, ColorPaletteCollection, ColorGeneratorConfig } from './types';
