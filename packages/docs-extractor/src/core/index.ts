/**
 * Core module - remaining core utilities
 *
 * Note: Most modules have been moved to specialized directories:
 * - scanner/ for ComponentScanner, EntryScanner
 * - analyzer/ for ProjectAnalyzer, TypeAnalyzer
 * - extraction/ for DocExtractor, PropsExtractor
 * - recipe/ for VariantsExtractor, RecipeDefaultsExtractor
 * - type-resolution/ for TypeResolver, ExternalTypeChecker, PropsFilter
 */

export { MergeEngine } from './merge-engine';

// Re-exports for backward compatibility
export { ComponentScanner } from '../scanner';
export { ProjectAnalyzer } from '../analyzer';
export { DocExtractor } from '../extraction';
export { VariantsExtractor, RecipeDefaultsExtractor } from '../recipe';
export { TypeResolver, ExternalTypeChecker, PropsFilter } from '../type-resolution';
