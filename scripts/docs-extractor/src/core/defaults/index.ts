// Default Variants (public API)
export { getDefaultValuesForNamespace, type DefaultValues } from './default-variants';

// Sprinkles Analyzer (public API)
export {
    loadSprinklesMeta,
    isTokenBasedSprinklesProp,
    isSprinklesProp,
    getAllSprinklesProps,
    getTokenSprinklesProps,
    getNonTokenSprinklesProps,
    getSprinklesDisplayType,
    clearCache,
    type SprinklesMeta,
    type PropDefinition,
} from './sprinkles-analyzer';
