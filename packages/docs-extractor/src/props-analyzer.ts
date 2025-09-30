import * as ts from 'typescript';

import type { PropInfo } from './types/types';
import {
    getJSDocDefaultValue,
    getJSDocDescription,
    parseTypeToArray,
    shouldIncludePropBySource,
} from './utils';
import { findCssFile, extractDefaultValue } from './vanilla-extract-analyzer';

/**
 * Extracts props information from a TypeScript type
 */
export function extractProps(
    checker: ts.TypeChecker,
    program: ts.Program,
    propsType: ts.Type,
    sourceFile: ts.SourceFile
): PropInfo[] {
    const props: PropInfo[] = [];
    const properties = propsType.getProperties();

    properties.forEach((prop) => {
        const propName = prop.getName();

        // Only include props from allowed sources (component files, Base UI, Vanilla Extract)
        if (!shouldIncludePropBySource(prop, checker, sourceFile)) {
            return;
        }

        // Extract type information
        const propType = checker.getTypeOfSymbol(prop);
        const typeString = checker.typeToString(propType);
        const isRequired = !prop.flags || !(prop.flags & ts.SymbolFlags.Optional);
        let description = getJSDocDescription(prop, checker);
        const defaultValue = getDefaultValue(program, prop, propName, sourceFile);

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
export function extractPropsType(checker: ts.TypeChecker, componentType: ts.Type): ts.Type | null {
    const typeString = checker.typeToString(componentType);
    
    // ForwardRefExoticComponent
    if (typeString.includes('ForwardRefExoticComponent')) {
        const forwardRefTypes = extractForwardRefTypes(checker, componentType);
        if (forwardRefTypes.propsType) {
            return forwardRefTypes.propsType;
        }
    }

    // MemoExoticComponent
    if (typeString.includes('MemoExoticComponent')) {
        const typeArgs = checker.getTypeArguments(componentType as ts.TypeReference);
        if (typeArgs && typeArgs.length > 0) {
            const componentTypeArg = typeArgs[0];
            return extractPropsType(checker, componentTypeArg);
        }
    }

    // Regular functional component
    const signatures = componentType.getCallSignatures();
    if (signatures.length === 0) return null;

    const firstParam = signatures[0].getParameters()[0];
    if (!firstParam) return null;

    return checker.getTypeOfSymbolAtLocation(firstParam, firstParam.valueDeclaration!);
}

/**
 * Extracts Props and Ref types from ForwardRefExoticComponent
 */
function extractForwardRefTypes(
    checker: ts.TypeChecker,
    type: ts.Type
): { propsType?: ts.Type; refType?: ts.Type } {
    const result: { propsType?: ts.Type; refType?: ts.Type } = {};

    // Get type arguments: ForwardRefExoticComponent<P & RefAttributes<T>>
    const typeArguments = checker.getTypeArguments(type as ts.TypeReference);
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
            const refTypeArguments = checker.getTypeArguments(t as ts.TypeReference);
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
function getDefaultValue(
    program: ts.Program,
    symbol: ts.Symbol,
    propName: string,
    sourceFile: ts.SourceFile,
): string | undefined {
    // Try CSS file first
    const cssFilePath = findCssFile(program, sourceFile.fileName);
    if (cssFilePath) {
        const defaultValue = extractDefaultValue(program, cssFilePath, propName);
        if (defaultValue !== undefined) {
            return defaultValue;
        }
    }

    // Try JSDoc @default tag
    return getJSDocDefaultValue(symbol);
}