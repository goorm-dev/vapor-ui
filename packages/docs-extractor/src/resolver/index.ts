/**
 * Resolver module exports
 */
export {
    COMPOUND_COMPONENT_BASES,
    isCompoundBase,
    type CompoundComponentBase,
} from './compound-config';
export {
    formatDisplayName,
    parseDisplayName,
    splitDisplayName,
    isCompoundDisplayName,
    getCompoundSubComponents,
} from './alias-mapper';
export { CompoundResolver, type CompoundComponentInfo } from './compound-resolver';
export { ComponentResolver, type ResolvedComponent } from './component-resolver';
