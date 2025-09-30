import * as fs from 'fs';
import { kebabCase } from 'lodash-es';
import * as path from 'path';
import prettier from 'prettier';
import * as ts from 'typescript';

import { ComponentTypeInfo } from './types/types';

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
        console.log(`출력 디렉토리 생성: ${outputPath}`);
    }
}

/**
 * Checks if a prop should be included based on its source location
 * Only includes props from: component files, Base UI d.ts files, and Vanilla Extract files
 */
export function shouldIncludePropBySource(
    prop: ts.Symbol,
    checker: ts.TypeChecker,
    sourceFile: ts.SourceFile,
): boolean {
    const symbol = prop.valueDeclaration
        ? checker.getSymbolAtLocation(prop.valueDeclaration)
        : prop;

    if (!symbol || !symbol.declarations) {
        return false;
    }

    for (const declaration of symbol.declarations) {
        const { fileName: declarationFileName } = declaration.getSourceFile();
        // 1. Component file itself (current source file)
        if (declarationFileName === sourceFile.fileName) {
            return true;
        }

        // 2. Base UI component d.ts files
        if (
            declarationFileName.includes('node_modules/@base-ui-components/react/esm') &&
            declarationFileName.endsWith('.d.ts')
        ) {
            return true;
        }

        // 3. Vanilla Extract files (.css.ts)
        if (declarationFileName.endsWith('.css.ts')) {
            return true;
        }

        // 4. Project's own type definition files (packages/core/src)
        if (
            declarationFileName.includes('packages/core/src') &&
            (declarationFileName.endsWith('.ts') || declarationFileName.endsWith('.tsx'))
        ) {
            return true;
        }
    }

    return false;
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
export function getLiteralValue(node: ts.Node): any {
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
 * Parses TypeScript union types into array format
 * Converts '"primary" | "success" | "warning" | undefined' to ["primary", "success", "warning"]
 * Removes "undefined" from union types for optional props
 */
export function parseTypeToArray(
    typeString: string,
    isRequired: boolean = false,
): string[] | string {
    // Check if it's a union type
    if (!typeString.includes(' | ')) {
        return typeString;
    }

    // Split by union separator and clean up each type
    let types = typeString
        .split(' | ')
        .map((type) => type.trim())
        .map((type) => {
            // Remove quotes from string literals: "primary" -> primary
            if (type.startsWith('"') && type.endsWith('"')) {
                return type.slice(1, -1);
            }
            // Remove quotes from string literals: 'primary' -> primary
            if (type.startsWith("'") && type.endsWith("'")) {
                return type.slice(1, -1);
            }
            // Keep other types as is: undefined, number, boolean, etc.
            return type;
        });

    // Remove "undefined" for optional props (not required)
    if (!isRequired) {
        types = types.filter((type) => type !== 'undefined');
    }

    return types;
}
