/**
 * Extractors module - all extraction and parsing logic
 */

// Project analysis
export { ProjectAnalyzer } from './project-analyzer';

// Component scanning
export { ComponentScanner } from './component-scanner';

// Props extraction
export { PropsExtractor } from './props-extractor';
export type { PropsExtractionOptions, PropsExtractorDependencies } from './props-extractor';

// Documentation extraction
export { DocExtractor } from './doc-extractor';

// Type formatting
export { TypeFormatter, type FormattedType, type TypeFormatterContext } from './type-formatter';

// Type resolution
export { ExternalTypeChecker } from './external-type-checker';
export { PropsFilter } from './props-filter';
export { TypeResolver } from './type-resolver';

// Recipe extraction (vanilla-extract)
export { VariantsExtractor } from './variants-extractor';
export { RecipeDefaultsExtractor } from './recipe-defaults-extractor';

// Sprinkles extraction
export { SprinklesConfigParser } from './sprinkles-config-parser';
export type { SprinklesPropertyConfig, SprinklesConfig } from './sprinkles-config-parser';
export { SprinklesTypeExtractor } from './sprinkles-type-extractor';
export { SprinklesTypeIntrospector } from './sprinkles-type-introspector';
