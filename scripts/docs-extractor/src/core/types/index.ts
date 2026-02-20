// Type Resolver (public API)
export { resolveType } from './type-resolver';

// Type Cleaner (public API)
export { cleanType, type TypeCleanResult } from './type-cleaner';

// Base UI Type Resolver (public API)
export { buildBaseUiTypeMap, type BaseUiTypeMap } from './base-ui-type-resolver';

// Declaration Source (shared across props/ and types/ modules)
export {
    getDeclarationSourceType,
    isExternalDeclaration,
    getSymbolSourcePath,
    isSymbolFromExternalSource,
    DeclarationSourceType,
} from '../shared/declaration-source';
