export {
    findComponentFiles,
    findFileByComponentName,
    normalizeComponentName,
    type ScannerOptions,
} from './core/scanner';
export { createProject, addSourceFiles, getExportedNodes, getNamespaces } from './core/project';
export { findTsconfig } from './core/config';
