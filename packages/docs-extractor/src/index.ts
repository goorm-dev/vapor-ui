// Type Extraction Core
export { TypeExtractor, extractComponentTypesFromFile } from './lib/type-extractor';

// Specialized Analyzers

export { ComponentAnalyzer } from './lib/component-analyzer';
export { PropsAnalyzer } from './lib/props-analyzer';
export { VanillaExtractAnalyzer } from './lib/vanilla-extract-analyzer';

// External Type Resolution
export { ExternalTypeResolver } from './lib/external-type-resolver';
export type { ExternalPackageConfig } from './lib/external-type-resolver';

// Types and Interfaces
export type { ComponentTypeInfo, PropInfo, TypeExtractorConfig } from './lib/types';

// Utilities
export {
    shouldIncludePropBySource,
    shouldExcludeProp,
    isReactReturnType,
    getJSDocDescription,
    getJSDocDefaultValue,
    getLiteralValue,
    parseTypeToArray,
} from './lib/utils';

// Main function for convenience
export { main } from './main';
