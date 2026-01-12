export {
    findComponentFiles,
    findFileByComponentName,
    normalizeComponentName,
    type ScannerOptions,
} from './core/scanner';
export { createProject, addSourceFiles, getExportedNodes, getNamespaces } from './core/project';
export { findTsconfig } from './core/config';
export { extractProps } from './core/props-extractor';
export type { ExtendedType, Property, PropsInfo, FilePropsResult } from './types/props';
