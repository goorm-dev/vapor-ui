// Scanner
export {
    findComponentFiles,
    findFileByComponentName,
    normalizeComponentName,
    type ScannerOptions,
} from './core/discovery';

// Project
export { createProject, addSourceFiles, getExportedNodes, getNamespaces } from './core/discovery';

// Config
export { findTsconfig } from './core/discovery';

// Extractor
export { extractProps } from './core/props-extractor';

// Types
export type { Property, PropsInfo, FilePropsResult, ExtractDiagnostic } from './types/props';

// Config System (NEW)
export {
    defineConfig,
    loadConfig,
    findConfigFile,
    getComponentConfig,
    type ExtractorConfig,
    type GlobalConfig,
    type SprinklesConfig,
    type ComponentConfig,
    type LoadConfigOptions,
    type LoadConfigResult,
} from './config';

// Sprinkles Analyzer (NEW)
export {
    loadSprinklesMeta,
    isTokenBasedSprinklesProp,
    isSprinklesProp,
    getAllSprinklesProps,
    getTokenSprinklesProps,
    getNonTokenSprinklesProps,
    getSprinklesDisplayType,
    type SprinklesMeta,
    type PropDefinition,
} from './core/defaults';

// i18n (NEW)
export {
    resolveOutputPath,
    resolveAllLanguagePaths,
    getTargetLanguages,
    type PathResolverOptions,
} from './i18n/path-resolver';

// Output (NEW)
export {
    writeJsonFile,
    writeMultipleFiles,
    ensureDirectory,
    formatWithPrettier,
} from './output/writer';
export { toKebabCase, formatFileName } from './output/formatter';
