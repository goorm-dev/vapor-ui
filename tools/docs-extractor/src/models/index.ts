/**
 * Models module - type definitions and data transformation
 */

// Type definitions
export * from './types';

// Data merging
export { MergeEngine } from './merge-engine';

// Compound component configuration
export {
    COMPOUND_COMPONENT_BASES,
    isCompoundBase,
    type CompoundComponentBase,
} from './compound-config';

// Display name formatting
export { formatDisplayName } from './alias-mapper';
