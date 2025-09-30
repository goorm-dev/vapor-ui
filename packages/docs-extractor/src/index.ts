// Type Extraction Core
export { TypeExtractor, extractComponentTypesFromFile } from '~/type';

// Specialized Analyzers

export { ComponentAnalyzer } from '~/component';
export { PropsAnalyzer } from '~/props';
export { VanillaExtractAnalyzer } from '~/vanilla-extract';

// External Type Resolution
export { ExternalTypeResolver } from '~/external';
export type { ExternalPackageConfig } from '~/external';

// Types and Interfaces
export type { ComponentTypeInfo, PropInfo, TypeExtractorConfig } from '~/types';

// Utilities
export {
    shouldIncludePropBySource,
    shouldExcludeProp,
    isReactReturnType,
    getJSDocDescription,
    getJSDocDefaultValue,
    getLiteralValue,
    parseTypeToArray,
} from '~/utils';
