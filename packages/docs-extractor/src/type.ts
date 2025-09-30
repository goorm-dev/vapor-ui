import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

import { ComponentAnalyzer } from './component';
import { ExternalTypeResolver } from './external';
import { PropsAnalyzer } from './props';
import type { ComponentTypeInfo, TypeExtractorConfig } from './types/types';
import { getJSDocDescription, isReactReturnType } from './utils';
import { VanillaExtractAnalyzer } from './vanilla-extract';

/**
 * Refactored TypeExtractor with separated concerns and modular architecture
 *
 * This class orchestrates the various analyzers to extract comprehensive
 * component type information including props, default values, and Base UI integration
 */
export class TypeExtractor {
    private program!: ts.Program;
    private checker!: ts.TypeChecker;
    private config: TypeExtractorConfig;
    // Specialized analyzers
    private vanillaExtractAnalyzer!: VanillaExtractAnalyzer;
    private componentAnalyzer!: ComponentAnalyzer;
    private propsAnalyzer!: PropsAnalyzer;
    private externalTypeResolver!: ExternalTypeResolver;

    constructor(config: TypeExtractorConfig) {
        this.config = config;
        this.initializeTypeScriptProgram();
        this.initializeAnalyzers();
    }

    /**
     * Extracts component type information from a file
     */
    extractComponentTypes(filePath: string): ComponentTypeInfo[] {
        const sourceFilePath = path.resolve(filePath);

        const sourceFile = this.program.getSourceFile(sourceFilePath);

        if (!sourceFile) {
            throw new Error(`Cannot find file: ${sourceFilePath}`);
        }

        const components: ComponentTypeInfo[] = [];

        // Get all exported symbols
        const moduleSymbol = this.checker.getSymbolAtLocation(sourceFile);
        if (moduleSymbol) {
            const exports = this.checker.getExportsOfModule(moduleSymbol);

            for (const exportSymbol of exports) {
                const exportResults = this.parseExport(exportSymbol, sourceFile);
                if (exportResults) {
                    components.push(...exportResults);
                }
            }
        }

        return components;
    }

    /**
     * Initializes the TypeScript program with configuration
     */
    private initializeTypeScriptProgram(): void {
        const resolvedConfigPath = path.resolve(this.config.configPath);
        const projectDirectory = path.dirname(resolvedConfigPath);

        const { config, error } = ts.readConfigFile(this.config.configPath, (filePath) =>
            fs.readFileSync(filePath).toString(),
        );

        if (error) {
            throw error;
        }

        const { options, errors, fileNames } = ts.parseJsonConfigFileContent(
            config,
            ts.sys,
            projectDirectory,
        );

        if (errors.length > 0) throw errors[0];

        // Include additional files if specified

        // Include external type files (Base UI, React types, etc.)
        this.externalTypeResolver = new ExternalTypeResolver(
            this.config.projectRoot || projectDirectory,
        );

        const externalTypeFiles = this.externalTypeResolver.resolveExternalTypeFiles(
            this.config.externalTypePaths,
        );

        this.program = ts.createProgram([...fileNames, ...externalTypeFiles], options);
        this.checker = this.program.getTypeChecker();
    }

    /**
     * Initializes specialized analyzer instances
     */
    private initializeAnalyzers(): void {
        this.vanillaExtractAnalyzer = new VanillaExtractAnalyzer(this.program);
        this.componentAnalyzer = new ComponentAnalyzer();
        this.propsAnalyzer = new PropsAnalyzer(this.checker, this.vanillaExtractAnalyzer);
    }

    /**
     * Parses an exported symbol to extract component information
     */
    private parseExport(
        exportSymbol: ts.Symbol,
        sourceFile: ts.SourceFile,
    ): ComponentTypeInfo[] | undefined {
        try {
            const exportDeclaration = exportSymbol.declarations?.[0];
            if (!exportDeclaration) {
                return;
            }

            if (ts.isExportSpecifier(exportDeclaration)) {
                // export { Button } pattern
                if (
                    ts.isExportDeclaration(exportDeclaration.parent.parent) &&
                    exportDeclaration.parent.parent.moduleSpecifier !== undefined
                ) {
                    // Skip re-exports e.g., export { Button } from './Button';
                    return;
                }

                const targetSymbol =
                    this.checker.getExportSpecifierLocalTargetSymbol(exportDeclaration);
                if (!targetSymbol) {
                    return;
                }

                let type: ts.Type;
                if (targetSymbol.declarations?.length) {
                    type = this.checker.getTypeAtLocation(targetSymbol.declarations[0]);
                } else {
                    type = this.checker.getTypeOfSymbol(targetSymbol);
                }

                return this.createComponentInfo(exportSymbol.name, targetSymbol, type, sourceFile);
            }
        } catch (error) {
            console.error('Export 파싱 중 오류:', error);
        }
    }

    /**
     * Creates component type information from symbol and type data
     */
    private createComponentInfo(
        name: string,
        symbol: ts.Symbol,
        type: ts.Type,
        sourceFile: ts.SourceFile,
    ): ComponentTypeInfo[] | undefined {
        // Check if it's a React component
        if (!isReactReturnType(type, this.checker)) {
            return;
        }

        const componentName = name;
        const description = getJSDocDescription(symbol, this.checker);

        // Extract props
        const propsType = this.propsAnalyzer.extractPropsType(type);
        const props = propsType ? this.propsAnalyzer.extractProps(propsType, sourceFile) : [];

        // Extract display name and default element
        const displayName = this.componentAnalyzer.extractDisplayName(symbol);
        const defaultElement = this.componentAnalyzer.extractDefaultElement(symbol);

        return [
            {
                name: componentName,
                displayName,
                description,
                props,
                defaultElement,
            },
        ];
    }
}

/**
 * Convenience function for extracting component types from a file
 */
export function extractComponentTypesFromFile(
    configPath: string,
    filePath: string,
    includeFiles?: string[],
    externalTypePaths?: string[],
): ComponentTypeInfo[] {
    const config: TypeExtractorConfig = {
        configPath,
        files: includeFiles,
        externalTypePaths,
    };

    const extractor = new TypeExtractor(config);
    return extractor.extractComponentTypes(filePath);
}
