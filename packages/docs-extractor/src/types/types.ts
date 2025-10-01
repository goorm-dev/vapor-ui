/**
 * Common types and interfaces for the type extraction system
 */
import type ts from 'typescript';
import type * as tae from 'typescript-api-extractor';

export interface RunOptions {
    files?: string[];
    configPath: string;
    out: string;
    externalTypePaths?: string[];
}

export interface TsConfig {
    options: ts.CompilerOptions;
    fileNames: string[];
}

export interface ExportProcessingResult {
    exports: tae.ExportNode[];
    errorCount: number;
    fileExportsMap: Map<string, tae.ExportNode[]>;
}

export interface ComponentTypeInfo {
    name: string;
    displayName?: string;
    description?: string;
    props: PropInfo[];
    defaultElement?: string;
}

export interface PropInfo {
    name: string;
    type: string | string[];
    required: boolean;
    description?: string;
    defaultValue?: string;
}

export interface BaseUIComponent {
    modulePath: string;
    componentName: string;
}

export interface TypeExtractorConfig {
    configPath: string;
    files?: string[];
    projectRoot?: string;
    externalTypePaths?: string[];
}
