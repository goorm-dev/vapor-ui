/**
 * Core module - re-exports all core extractors and analyzers
 */

export { ComponentScanner } from './component-scanner.js';
export { DocExtractor } from './doc-extractor.js';
export { MergeEngine } from './merge-engine.js';
export { ProjectAnalyzer } from './project-analyzer.js';
export { RecipeDefaultsExtractor } from './recipe-defaults-extractor.js';
export { VariantsExtractor } from './variants-extractor.js';

// Re-export TypeResolver from the new location for backward compatibility
export { TypeResolver, ExternalTypeChecker, PropsFilter } from './type-resolver.js';
