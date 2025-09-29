import * as ts from 'typescript';
import type { PropInfo } from './types';
import { shouldExcludeProp, getJSDocDescription, getJSDocDefaultValue, parseTypeToArray } from './utils';
import type { VanillaExtractAnalyzer } from './vanilla-extract-analyzer';
import type { BaseUIAnalyzer } from './base-ui-analyzer';

/**
 * Analyzes TypeScript props and extracts prop information
 * including types, descriptions, and default values
 */
export class PropsAnalyzer {
    private checker: ts.TypeChecker;
    private vanillaExtractAnalyzer: VanillaExtractAnalyzer;
    private baseUIAnalyzer: BaseUIAnalyzer;

    constructor(
        checker: ts.TypeChecker,
        vanillaExtractAnalyzer: VanillaExtractAnalyzer,
        baseUIAnalyzer: BaseUIAnalyzer,
    ) {
        this.checker = checker;
        this.vanillaExtractAnalyzer = vanillaExtractAnalyzer;
        this.baseUIAnalyzer = baseUIAnalyzer;
    }

    /**
     * Extracts props information from a TypeScript type
     */
    extractProps(propsType: ts.Type, sourceFile: ts.SourceFile): PropInfo[] {
        const props: PropInfo[] = [];
        const properties = propsType.getProperties();

        properties.forEach((prop) => {
            const propName = prop.getName();

            // Filter out built-in HTML/React attributes
            if (shouldExcludeProp(propName)) {
                return;
            }

            // Extract type information
            const propType = this.checker.getTypeOfSymbol(prop);
            const typeString = this.checker.typeToString(propType);

            const isRequired = !prop.flags || !(prop.flags & ts.SymbolFlags.Optional);
            let description = getJSDocDescription(prop, this.checker);
            const defaultValue = this.getDefaultValue(prop, propName, sourceFile);

            // Try to get description from Base UI if not found
            if (!description) {
                description = this.getBaseUIDescription(prop, propName, sourceFile);
            }

            props.push({
                name: propName,
                type: parseTypeToArray(typeString),
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
            const defaultValue = this.vanillaExtractAnalyzer.extractDefaultValue(cssFilePath, propName);
            if (defaultValue !== undefined) {
                return defaultValue;
            }
        }

        // Try JSDoc @default tag
        return getJSDocDefaultValue(symbol);
    }

    /**
     * Gets Base UI description for a prop
     */
    private getBaseUIDescription(
        prop: ts.Symbol,
        propName: string,
        sourceFile: ts.SourceFile,
    ): string | undefined {
        const usedBaseUIComponents = this.baseUIAnalyzer.findUsedBaseUIComponents(sourceFile);

        if (usedBaseUIComponents.length === 0) {
            return undefined;
        }

        // Try each Base UI component
        for (const baseUIComponent of usedBaseUIComponents) {
            try {
                const description = this.baseUIAnalyzer.getBaseUIPropertyDescription(baseUIComponent, propName);
                if (description) {
                    return description;
                }
            } catch (error) {
                continue;
            }
        }

        return undefined;
    }
}