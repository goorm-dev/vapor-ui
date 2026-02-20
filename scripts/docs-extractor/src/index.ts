// === Core Extractor ===
export { extractProps } from './core/props-extractor';
export type { ExtractOptions } from './core/props-extractor';

// === Data Types ===
export type { Property, PropsInfo, FilePropsResult } from './types/props';

// === Project & Discovery ===
export {
    createProject,
    addSourceFiles,
    getExportedNodes,
    getNamespaces,
    findTsconfig,
    findComponentFiles,
    findFileByComponentName,
    normalizeComponentName,
    type ScannerOptions,
} from './core/discovery';

// === Configuration ===
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

// === Sprinkles ===
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

// === i18n ===
export {
    resolveOutputPath,
    resolveAllLanguagePaths,
    getTargetLanguages,
    type PathResolverOptions,
} from './i18n/path-resolver';

// === Output ===
export {
    writeJsonFile,
    writeMultipleFiles,
    ensureDirectory,
    formatWithPrettier,
} from './output/writer';
export { toKebabCase, formatFileName } from './output/formatter';
