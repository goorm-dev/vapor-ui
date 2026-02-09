// Type Resolver
export {
    resolveType,
    simplifyNodeModulesImports,
    simplifyReactElementGeneric,
    simplifyForwardRefType,
    type TypeResolverPlugin,
    type TypeResolverContext,
} from './type-resolver';

// Type Cleaner
export { cleanType, containsStateCallback, simplifyStateCallback, type TypeCleanResult } from './type-cleaner';

// Base UI Type Resolver
export {
    buildBaseUiTypeMap,
    resolveBaseUiType,
    extractSimplifiedTypeName,
    collectNamespaceTypeAliases,
    findComponentPrefix,
    formatVaporTypePath,
    type BaseUiTypeMap,
    type BaseUiTypeEntry,
} from './base-ui-type-resolver';

// Declaration Source
export {
    getDeclarationSourceType,
    isExternalDeclaration,
    getSymbolSourcePath,
    isSymbolFromExternalSource,
    DeclarationSourceType,
} from './declaration-source';
