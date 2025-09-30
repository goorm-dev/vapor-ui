import ts from 'typescript';
import * as tae from 'typescript-api-extractor';

export interface RunOptions {
    files?: string[];
    configPath: string;
    out: string;
    language: string;
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
