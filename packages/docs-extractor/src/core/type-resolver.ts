/**
 * Re-export TypeResolver from the new type-resolution module
 * This file is kept for backward compatibility with existing imports
 *
 * @deprecated Import from '../type-resolution/index.js' instead
 */
export { TypeResolver } from '../type-resolution/index.js';

// Also export the sub-modules for direct access if needed
export { ExternalTypeChecker, PropsFilter } from '../type-resolution/index.js';
