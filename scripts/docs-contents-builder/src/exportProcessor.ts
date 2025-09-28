import * as fs from 'node:fs';
import * as path from 'node:path';
import ts from 'typescript';
import * as tae from 'typescript-api-extractor';

import { ExportProcessingResult } from './types';
import { isDebug, shouldSkipFile } from './utils';

export class ExportProcessor {
    private allExports: tae.ExportNode[] = [];
    private fileExportsMap = new Map<string, tae.ExportNode[]>();
    private errorCounter = 0;

    constructor(private program: ts.Program) {}

    processFiles(sourceFiles: string[]): ExportProcessingResult {
        for (const file of sourceFiles) {
            this.processFile(file);
        }

        return {
            exports: this.allExports,
            errorCount: this.errorCounter,
            fileExportsMap: this.fileExportsMap,
        };
    }

    private processFile(file: string): void {
        if (!isDebug) {
            console.log(`Processing ${file}`);
            console.group();
        }

        try {
            if (shouldSkipFile(file)) {
                if (!isDebug) {
                    console.log('Skipping index file (re-exports only)');
                }
                return;
            }

            const result = this.parseFile(file);
            if (result) {
                this.allExports.push(...result.exports);
                this.fileExportsMap.set(file, result.exports);
            }
        } catch (error) {
            this.handleError(file, error);
        } finally {
            if (!isDebug) {
                console.groupEnd();
            }
        }
    }

    private parseFile(file: string) {
        const absoluteFilePath = path.resolve(file);
        const sourceFile = this.program.getSourceFile(absoluteFilePath);

        if (!sourceFile) {
            console.error(`  ❌ Source file not found in program: ${absoluteFilePath}`);
            this.errorCounter += 1;
            return null;
        }

        const result = tae.parseFromProgram(file, this.program);
        fs.writeFileSync('docs.json', JSON.stringify(result, null, 2));
        return result;
    }

    private handleError(file: string, error: any): void {
        console.error(`⛔ Error processing ${file}:`);
        console.error(`  Message: ${error.message}`);
        console.error(`  Code: ${error.code || 'N/A'}`);
        console.error(`  Stack: ${error.stack || 'N/A'}`);
        if (error.innerError) {
            console.error(`  Inner Error: ${JSON.stringify(error.innerError)}`);
        }
        this.errorCounter += 1;
    }
}
