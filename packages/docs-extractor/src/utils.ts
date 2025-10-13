import * as fs from 'fs';
import { kebabCase } from 'lodash-es';
import * as path from 'path';
import prettier from 'prettier';
import ts from 'typescript';

import type { ComponentTypeInfo } from './types/types';

/**
 * Utility functions for TypeScript analysis and component extraction
 */

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
    generatedAt: string;
    sourceFile: string;
}

/**
 * Creates component data structure from ComponentTypeInfo
 */
export function createComponentData(
    component: ComponentTypeInfo,
    sourceFile: string,
): ComponentData {
    return {
        name: component.name,
        displayName: component.displayName,
        description: component.description,
        props: component.props.map((prop) => ({
            name: prop.name,
            type: prop.type,
            required: prop.required,
            description: prop.description,
            defaultValue: prop.defaultValue,
        })),
        defaultElement: component.defaultElement,
        generatedAt: new Date().toISOString(),
        sourceFile,
    };
}

/**
 * Writes component data to a JSON file with prettier formatting
 */
export async function writeComponentDataToFile(
    componentData: ComponentData,
    outputPath: string,
): Promise<void> {
    const fileName = `${kebabCase(componentData.name)}.json`;
    const componentOutputPath = path.join(outputPath, fileName);

    const jsonString = JSON.stringify(componentData, null, 2);
    const prettierOptions = (await prettier.resolveConfig(componentOutputPath)) || {};
    const formattedJson = await prettier.format(jsonString, {
        ...prettierOptions,
        parser: 'json',
    });

    fs.writeFileSync(componentOutputPath, formattedJson, 'utf8');
    console.log(`   → JSON 저장: ${componentOutputPath}`);
}

/**
 * Ensures output directory exists, creates if necessary
 */
export function ensureOutputDirectory(outputPath: string): void {
    if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath, { recursive: true });
    }
}

/**
 * Checks if a TypeScript type represents a React component
 */

const componentReturnTypes = [/Element/, /ReactNode/, /ReactElement(<.*>)?/];

export function isReactReturnType(type: ts.Type, checker: ts.TypeChecker) {
    const typeString = checker.typeToString(type);

    return componentReturnTypes.some((regex) => regex.test(typeString));
}

/**
 * Extracts JSDoc description from a TypeScript symbol
 */
export function getJSDocDescription(
    symbol: ts.Symbol,
    checker: ts.TypeChecker,
): string | undefined {
    const documentation = symbol.getDocumentationComment(checker);

    if (documentation.length > 0) {
        return documentation.map((part) => part.text).join('');
    }

    return undefined;
}

/**
 * Extracts default value from JSDoc @default tag
 */
export function getJSDocDefaultValue(symbol: ts.Symbol): string | undefined {
    const jsDocTags = symbol.getJsDocTags();
    const defaultTag = jsDocTags?.find((tag) => tag.name === 'default');
    if (defaultTag && defaultTag.text) {
        return defaultTag.text.map((part) => part.text).join('');
    }
    return undefined;
}

/**
 * Parses a literal value from a TypeScript AST node
 */
export function getLiteralValue(node: ts.Node): string | number | boolean | null | undefined {
    if (ts.isStringLiteral(node)) {
        return node.text;
    }
    if (ts.isNumericLiteral(node)) {
        return Number(node.text);
    }
    if (node.kind === ts.SyntaxKind.TrueKeyword) {
        return true;
    }
    if (node.kind === ts.SyntaxKind.FalseKeyword) {
        return false;
    }
    if (node.kind === ts.SyntaxKind.NullKeyword) {
        return null;
    }
    return undefined;
}

/**
 * Extracts the full union types directly from TypeScript type structure
 * This avoids the truncation issue with checker.typeToString()
 */
export function extractFullUnionTypes(
    type: ts.Type,
    checker: ts.TypeChecker,
    isRequired: boolean = false,
): string[] | string {
    // Check if it's a union type
    if (type.isUnion()) {
        let types: string[] = [];
        const seenTypes = new Set<string>();

        for (const unionType of type.types) {
            // Handle string literal types
            if (unionType.isStringLiteral()) {
                types.push(unionType.value);
                continue;
            }
            // Handle numeric literal types
            if (unionType.isNumberLiteral()) {
                types.push(unionType.value.toString());
                continue;
            }
            // Handle boolean literal types
            if (unionType.flags & ts.TypeFlags.BooleanLiteral) {
                types.push(checker.typeToString(unionType));
                continue;
            }

            const typeString = checker.typeToString(unionType);

            // Simplify render prop types to be more user-friendly - show only ReactElement
            if (typeString.includes('ReactElement') || typeString.includes('ComponentRenderFn')) {
                if (!seenTypes.has('ReactElement')) {
                    types.push('ReactElement');
                    seenTypes.add('ReactElement');
                }
                continue;
            }

            // For other types, use the full type string
            types.push(typeString);
        }

        // Remove "undefined" for optional props (not required)
        if (!isRequired) {
            types = types.filter((type) => type !== 'undefined');
        }

        // Remove duplicates while preserving order
        return Array.from(new Set(types));
    }

    // Not a union type, return as string
    const typeString = checker.typeToString(type);

    // Simplify single complex render prop types - show only ReactElement
    if (typeString.includes('ReactElement') || typeString.includes('ComponentRenderFn')) {
        return 'ReactElement';
    }

    return typeString;
}

/**
 * Returns the first array if it's not empty, otherwise returns the second array
 */
export function selectNonEmptyArray<T>(firstArray: T[] | undefined, secondArray: T[]): T[] {
    return firstArray && firstArray.length > 0 ? firstArray : secondArray;
}
