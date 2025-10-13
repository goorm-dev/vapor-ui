import { isEmpty } from 'lodash-es';
import * as fs from 'node:fs';
import * as path from 'path';
import * as prettier from 'prettier';
import type * as ts from 'typescript';

import { processComponentExportedSymbols } from './componentHandler';
import { createComponentData } from './formatter';
import type { ComponentTypeInfo } from './types';

/**
 * Source file processing utilities
 */

/**
 * Processes source files and extracts component data
 */
export async function processSourceFiles(
    resolvedFiles: string[],
    configDir: string,
    program: ts.Program,
    checker: ts.TypeChecker,
    outputPath: string,
): Promise<void> {
    if (isEmpty(resolvedFiles)) {
        console.log('No files found to analyze. Check the files configuration.');
        return;
    }

    console.log(`Processing ${resolvedFiles.length} files...`);

    for (const filePath of resolvedFiles) {
        try {
            await processSourceFile(filePath, configDir, program, checker, outputPath);
        } catch (error) {
            console.error(`Error processing ${filePath}:`, error);
        }
    }
}

/**
 * Processes a single source file
 */
async function processSourceFile(
    filePath: string,
    configDir: string,
    program: ts.Program,
    checker: ts.TypeChecker,
    outputPath: string,
): Promise<void> {
    const fullPath = path.resolve(configDir, filePath);
    const sourceFile = program.getSourceFile(filePath);

    if (!sourceFile) {
        throw new Error(`Program doesn't contain file: "${filePath}"`);
    }

    console.log(`Analyzing: ${filePath}`);

    const components = processComponentExportedSymbols({
        program,
        checker,
        sourceFile,
    });

    if (components.length === 0) {
        console.log(`  No components found in ${filePath}`);
        return;
    }

    for (const component of components) {
        await generateComponentOutput(component, fullPath, outputPath);
    }
}

/**
 * Generates output file for a component
 */
async function generateComponentOutput(
    component: ComponentTypeInfo,
    fullPath: string,
    outputPath: string,
): Promise<void> {
    const componentData = createComponentData(component, fullPath);
    const outputFile = path.join(outputPath, `${componentData.name}.json`);

    // Ensure output directory exists
    fs.mkdirSync(path.dirname(outputFile), { recursive: true });

    // Create JSON string
    const jsonString = JSON.stringify(componentData, null, 2);

    // Format with Prettier
    const prettierOptions = (await prettier.resolveConfig(outputFile)) || {};
    const formattedJson = await prettier.format(jsonString, {
        ...prettierOptions,
        parser: 'json',
    });

    // Write component data to JSON file
    fs.writeFileSync(outputFile, formattedJson);

    console.log(`  Generated: ${path.relative(process.cwd(), outputFile)}`);
}
