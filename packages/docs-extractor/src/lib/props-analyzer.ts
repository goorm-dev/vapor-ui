import * as ts from 'typescript';

import type { PropInfo } from './types';
import {
    getJSDocDefaultValue,
    getJSDocDescription,
    parseTypeToArray,
    shouldIncludePropBySource,
} from './utils';
import type { VanillaExtractAnalyzer } from './vanilla-extract-analyzer';

/**
 * Analyzes TypeScript props and extracts prop information
 * including types, descriptions, and default values
 */
export class PropsAnalyzer {
    private checker: ts.TypeChecker;
    private vanillaExtractAnalyzer: VanillaExtractAnalyzer;

    constructor(checker: ts.TypeChecker, vanillaExtractAnalyzer: VanillaExtractAnalyzer) {
        this.checker = checker;
        this.vanillaExtractAnalyzer = vanillaExtractAnalyzer;
    }

    /**
     * Extracts props information from a TypeScript type
     */
    extractProps(propsType: ts.Type, sourceFile: ts.SourceFile): PropInfo[] {
        const props: PropInfo[] = [];
        const properties = propsType.getProperties();

        properties.forEach((prop) => {
            const propName = prop.getName();

            // Only include props from allowed sources (component files, Base UI, Vanilla Extract)
            if (!shouldIncludePropBySource(prop, this.checker, sourceFile)) {
                return;
            }

            // Extract type information
            const propType = this.checker.getTypeOfSymbol(prop);

            const typeString = this.checker.typeToString(propType);

            const isRequired = !prop.flags || !(prop.flags & ts.SymbolFlags.Optional);
            let description = getJSDocDescription(prop, this.checker);
            const defaultValue = this.getDefaultValue(prop, propName, sourceFile);

            props.push({
                name: propName,
                type: parseTypeToArray(typeString, isRequired),
                required: isRequired,
                description,
                defaultValue,
            });
        });

        return props;
    }

    /**
     * Extracts props type from a component type
     */
    extractPropsType(componentType: ts.Type): ts.Type | null {
        const typeString = this.checker.typeToString(componentType);
        // ForwardRefExoticComponent
        if (typeString.includes('ForwardRefExoticComponent')) {
            const forwardRefTypes = this.extractForwardRefTypes(componentType);
            if (forwardRefTypes.propsType) {
                return forwardRefTypes.propsType;
            }
        }

        // MemoExoticComponent
        if (typeString.includes('MemoExoticComponent')) {
            const typeArgs = this.checker.getTypeArguments(componentType as ts.TypeReference);
            if (typeArgs && typeArgs.length > 0) {
                const componentTypeArg = typeArgs[0];
                return this.extractPropsType(componentTypeArg);
            }
        }

        // Regular functional component
        const signatures = componentType.getCallSignatures();
        if (signatures.length === 0) return null;

        const firstParam = signatures[0].getParameters()[0];
        if (!firstParam) return null;

        return this.checker.getTypeOfSymbolAtLocation(firstParam, firstParam.valueDeclaration!);
    }

    /**
     * Extracts Props and Ref types from ForwardRefExoticComponent
     */
    private extractForwardRefTypes(type: ts.Type): { propsType?: ts.Type; refType?: ts.Type } {
        const result: { propsType?: ts.Type; refType?: ts.Type } = {};

        // Get type arguments: ForwardRefExoticComponent<P & RefAttributes<T>>
        const typeArguments = this.checker.getTypeArguments(type as ts.TypeReference);
        if (!typeArguments || typeArguments.length === 0) {
            return result;
        }
        const innerType = typeArguments[0];

        // Handle intersection type (Props & RefAttributes)
        if (!innerType.isIntersection()) {
            result.propsType = innerType;
            return result;
        }

        // Separate Props and Ref types
        for (const t of innerType.types) {
            const symbol = t.getSymbol();
            if (symbol && symbol.getName() === 'RefAttributes') {
                // Extract T from RefAttributes<T>
                const refTypeArguments = this.checker.getTypeArguments(t as ts.TypeReference);
                if (refTypeArguments && refTypeArguments.length > 0) {
                    result.refType = refTypeArguments[0];
                }
            } else {
                result.propsType = t;
            }
        }

        return result;
    }

    /**
     * Gets default value for a prop from various sources
     */
    private getDefaultValue(
        symbol: ts.Symbol,
        propName: string,
        sourceFile: ts.SourceFile,
    ): string | undefined {
        // Try CSS file first
        const cssFilePath = this.vanillaExtractAnalyzer.findCssFile(sourceFile.fileName);
        if (cssFilePath) {
            const defaultValue = this.vanillaExtractAnalyzer.extractDefaultValue(
                cssFilePath,
                propName,
            );
            if (defaultValue !== undefined) {
                return defaultValue;
            }
        }

        // Try JSDoc @default tag
        return getJSDocDefaultValue(symbol);
    }
}
