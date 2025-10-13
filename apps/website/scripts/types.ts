/**
 * Shared TypeScript interfaces for the docs API builder
 */
import type * as ts from 'typescript';

export interface BuildOptions {
    configPath: string;
    out: string;
    files: string[];
    externalTypePaths: string[];
}

export interface PropInfo {
    name: string;
    type: string | string[];
    required: boolean;
    description?: string;
    defaultValue?: string;
}

export interface ComponentTypeInfo {
    name: string;
    displayName?: string;
    description?: string;
    props: PropInfo[];
    defaultElement?: string;
}

export interface ComponentData {
    name: string;
    displayName?: string;
    description?: string;
    props: Array<{
        name: string;
        type: string | string[];
        required: boolean;
        description?: string;
        defaultValue?: string;
    }>;
    defaultElement?: string;
    sourceFile: string;
}

export interface ConfigResult {
    config: TSConfig;
    configDir: string;
}

export interface FileResolutionResult {
    resolvedFiles: string[];
}

export interface TSConfig {
    options: ts.CompilerOptions;
    fileNames: string[];
}
