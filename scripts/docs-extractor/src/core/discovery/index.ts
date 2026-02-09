// Scanner
export {
    findComponentFiles,
    findFileByComponentName,
    normalizeComponentName,
    type ScannerOptions,
} from './scanner';

// Project
export { createProject, addSourceFiles, getExportedNodes, getNamespaces } from './project';

// Config
export { findTsconfig } from './config';

// Component Discovery
export {
    getExportedNamespaces,
    findExportedInterfaceProps,
    getComponentDescription,
    getDefaultElement,
} from './component-discovery';
