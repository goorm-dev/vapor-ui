/**
 * Type Resolution module - handles type checking, filtering, and resolution
 */

export { ExternalTypeChecker } from './external-type-checker';
export { PropsFilter } from './props-filter';
export { TypeResolver } from './type-resolver';

// Re-export TypeFormatter from extraction module for backward compatibility
export {
    TypeFormatter,
    type FormattedType,
    type TypeFormatterContext,
} from '../extraction/type-formatter';
