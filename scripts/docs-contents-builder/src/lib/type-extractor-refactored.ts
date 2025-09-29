import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

import type { ComponentTypeInfo, TypeExtractorConfig } from './types';
import { isReactComponent, getJSDocDescription } from './utils';
import { VanillaExtractAnalyzer } from './vanilla-extract-analyzer';
import { BaseUIAnalyzer } from './base-ui-analyzer';
import { ComponentAnalyzer } from './component-analyzer';
import { PropsAnalyzer } from './props-analyzer';

/**
 * Refactored TypeExtractor with separated concerns and modular architecture
 * 
 * This class orchestrates the various analyzers to extract comprehensive
 * component type information including props, default values, and Base UI integration
 */
export class TypeExtractor {
    private program: ts.Program;
    private checker: ts.TypeChecker;
    private config: TypeExtractorConfig;

    // Specialized analyzers
    private vanillaExtractAnalyzer: VanillaExtractAnalyzer;
    private baseUIAnalyzer: BaseUIAnalyzer;
    private componentAnalyzer: ComponentAnalyzer;
    private propsAnalyzer: PropsAnalyzer;

    constructor(config: TypeExtractorConfig) {
        this.config = config;
        this.initializeTypeScriptProgram();
        this.initializeAnalyzers();
    }

    /**
     * Extracts component type information from a file
     */
    extractComponentTypes(filePath: string): ComponentTypeInfo[] {
        const absolutePath = path.resolve(filePath);
        const sourceFile = this.program.getSourceFile(absolutePath);
        if (!sourceFile) {
            throw new Error(`파일을 찾을 수 없습니다: ${absolutePath}`);
        }

        const components: ComponentTypeInfo[] = [];

        // Get all exported symbols
        const moduleSymbol = this.checker.getSymbolAtLocation(sourceFile);
        if (moduleSymbol) {
            const exports = this.checker.getExportsOfModule(moduleSymbol);
            console.log('찾은 exports:', exports.map((e) => e.name));

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
        const absoluteConfigPath = path.resolve(this.config.configPath);
        const configDir = path.dirname(absoluteConfigPath);
        const configFile = ts.readConfigFile(absoluteConfigPath, ts.sys.readFile);

        if (configFile.error) {
            throw new Error(`tsconfig.json 읽기 실패: ${configFile.error.messageText}`);
        }

        const parsedConfig = ts.parseJsonConfigFileContent(configFile.config, ts.sys, configDir);

        // Include additional files if specified
        let sourceFiles = parsedConfig.fileNames;
        if (this.config.files && this.config.files.length > 0) {
            const additionalFiles = this.config.files.map((f) => path.resolve(configDir, f));
            sourceFiles = [...parsedConfig.fileNames, ...additionalFiles];
        }

        // Include relevant Base UI type files
        const baseUIFiles = this.findRelevantBaseUITypeFiles(sourceFiles);
        sourceFiles = [...sourceFiles, ...baseUIFiles];

        console.log('설정 디렉토리:', configDir);
        console.log('tsconfig에서 찾은 파일 수:', parsedConfig.fileNames.length);
        console.log('추가 분석 파일들:', this.config.files || []);
        console.log('Base UI 타입 파일 수:', baseUIFiles.length);
        console.log('전체 분석할 파일 수:', sourceFiles.length);

        this.program = ts.createProgram(sourceFiles, parsedConfig.options);
        this.checker = this.program.getTypeChecker();
    }

    /**
     * Initializes specialized analyzer instances
     */
    private initializeAnalyzers(): void {
        this.vanillaExtractAnalyzer = new VanillaExtractAnalyzer(this.program);
        this.baseUIAnalyzer = new BaseUIAnalyzer(this.program, this.config.projectRoot);
        this.componentAnalyzer = new ComponentAnalyzer();
        this.propsAnalyzer = new PropsAnalyzer(
            this.checker,
            this.vanillaExtractAnalyzer,
            this.baseUIAnalyzer,
        );
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
                    // Skip re-exports
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
        if (!isReactComponent(type, this.checker)) {
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

    /**
     * Finds relevant Base UI type files for the source files being analyzed
     */
    private findRelevantBaseUITypeFiles(sourceFiles: string[]): string[] {
        // Initialize temporary Base UI analyzer for discovery
        const tempBaseUIAnalyzer = new BaseUIAnalyzer(this.program, this.config.projectRoot);
        return tempBaseUIAnalyzer.findRelevantBaseUITypeFiles(sourceFiles);
    }
}

/**
 * Convenience function for extracting component types from a file
 */
export function extractComponentTypesFromFile(
    configPath: string,
    filePath: string,
    includeFiles?: string[],
): ComponentTypeInfo[] {
    const config: TypeExtractorConfig = {
        configPath,
        files: includeFiles,
    };
    
    const extractor = new TypeExtractor(config);
    return extractor.extractComponentTypes(filePath);
}