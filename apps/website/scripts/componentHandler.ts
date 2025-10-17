import * as path from 'node:path';
import * as ts from 'typescript';

import type { ComponentTypeInfo, PropInfo } from './types';

/**
 * Component Handler
 * Orchestrates component analysis using parser modules
 */

/**
 * Handles export specifier parsing for components
 */
export function handleExportSpecifier(
    program: ts.Program,
    checker: ts.TypeChecker,
    exportDeclaration: ts.ExportSpecifier,
    exportSymbol: ts.Symbol,
    sourceFile: ts.SourceFile,
): ComponentTypeInfo[] | undefined {
    const result = processExportSpecifier(checker, exportDeclaration);

    if (!result) {
        return;
    }

    const { targetSymbol, type } = result;
    return createComponentInfo(program, checker, exportSymbol.name, targetSymbol, type, sourceFile);
}

/**
 * Processes all exported symbols from a module for component extraction
 */
export const processComponentExportedSymbols = ({
    program,
    checker,
    sourceFile,
}: {
    program: ts.Program;
    checker: ts.TypeChecker;
    sourceFile: ts.SourceFile;
}) => {
    let components: ComponentTypeInfo[] = [];
    const errors: string[] = [];

    try {
        const sourceFileSymbol = checker.getSymbolAtLocation(sourceFile);

        if (!sourceFileSymbol) {
            throw new Error('Failed to get the source file symbol');
        }

        const exportedSymbols = checker.getExportsOfModule(sourceFileSymbol);

        for (const symbol of exportedSymbols) {
            const exportDeclaration = symbol.declarations?.[0];

            if (!exportDeclaration) {
                throw new Error(`No declaration found for symbol: ${symbol.name}`);
            }

            if (ts.isExportSpecifier(exportDeclaration)) {
                try {
                    const result = handleExportSpecifier(
                        program,
                        checker,
                        exportDeclaration,
                        symbol,
                        sourceFile,
                    );
                    if (result) {
                        components = components.concat(result);
                    }
                } catch (error) {
                    errors.push(
                        `Error processing ${symbol.name}: ${
                            error instanceof Error ? error.message : 'Unknown export parsing error'
                        }`,
                    );
                }
            }
        }

        // Log errors if any occurred (side effect moved to caller)
        if (errors.length > 0) {
            console.error('Export parsing errors:', errors.join(', '));
        }
    } catch (error) {
        throw error;
    }

    return components;
};

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

export function createComponentInfo(
    program: ts.Program,
    checker: ts.TypeChecker,
    name: string,
    symbol: ts.Symbol,
    type: ts.Type,
    sourceFile: ts.SourceFile,
): ComponentTypeInfo[] | undefined {
    // Check if it's a React component
    if (!isReactReturnType(type, checker)) {
        return;
    }

    const componentName = name;
    const description = getJSDocDescription(symbol, checker);

    // Extract props
    const propsType = extractPropsType(checker, type);
    const props = propsType ? extractProps(checker, program, propsType, sourceFile) : [];

    // Extract display name and default element
    const displayName = extractDisplayName(symbol);
    const defaultElement = extractDefaultElement(symbol);

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
 * Checks if a TypeScript type represents a React component
 */

const componentReturnTypes = [/Element/, /ReactNode/, /ReactElement(<.*>)?/];

export function isReactReturnType(type: ts.Type, checker: ts.TypeChecker) {
    const typeString = checker.typeToString(type);

    return componentReturnTypes.some((regex) => regex.test(typeString));
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
 * Extracts props information from props type
 */
export function extractProps(
    checker: ts.TypeChecker,
    program: ts.Program,
    propsType: ts.Type,
    sourceFile: ts.SourceFile,
): PropInfo[] {
    const props: PropInfo[] = [];
    const properties = propsType.getProperties();

    properties.forEach((prop) => {
        const propName = prop.getName();

        // Only include props from allowed sources (component files, Base UI, Vanilla Extract)
        if (!shouldIncludeExternalProp(prop, checker, sourceFile)) {
            return;
        }

        // Extract type information
        const propType = checker.getTypeOfSymbol(prop);
        const isRequired = !prop.flags || !(prop.flags & ts.SymbolFlags.Optional);
        const description = getJSDocDescription(prop, checker);
        const defaultValue = getDefaultValue(program, prop, propName, sourceFile);

        props.push({
            name: propName,
            type: extractFullUnionTypes(propType, checker, isRequired),
            required: isRequired,
            description,
            ...(defaultValue !== undefined && { defaultValue }),
        });
    });

    return props;
}

/**
 * Extracts the display name from a component symbol using AST traversal
 */
export function extractDisplayName(symbol: ts.Symbol): string | undefined {
    const declarations = symbol.getDeclarations();
    if (!declarations) return undefined;

    const symbolName = symbol.getName();

    for (const decl of declarations) {
        const sourceFile = decl.getSourceFile();
        let displayName: string | undefined;

        const visit = (node: ts.Node) => {
            // Look for PropertyAccessExpression: Component.displayName = 'value'
            if (ts.isExpressionStatement(node) && ts.isBinaryExpression(node.expression)) {
                const { left, operatorToken, right } = node.expression;

                // Check if it's an assignment (=)
                if (operatorToken.kind === ts.SyntaxKind.EqualsToken) {
                    // Check if left side is Component.displayName
                    if (
                        ts.isPropertyAccessExpression(left) &&
                        ts.isIdentifier(left.expression) &&
                        left.expression.text === symbolName &&
                        ts.isIdentifier(left.name) &&
                        left.name.text === 'displayName'
                    ) {
                        // Extract string literal value from right side
                        if (ts.isStringLiteral(right)) {
                            displayName = right.text;
                        }
                    }
                }
            }

            // Continue traversing if not found yet
            if (!displayName) {
                ts.forEachChild(node, visit);
            }
        };

        visit(sourceFile);

        if (displayName) {
            return displayName;
        }
    }

    return undefined;
}

/**
 * Extracts the default rendering element from a component
 */
export function extractDefaultElement(symbol: ts.Symbol): string | undefined {
    const declarations = symbol.getDeclarations();
    if (!declarations) return undefined;

    for (const decl of declarations) {
        let targetNode: ts.Node | undefined;

        if (ts.isVariableDeclaration(decl) && decl.initializer) {
            targetNode = decl.initializer;
        } else if (ts.isExportAssignment(decl)) {
            targetNode = decl.expression;
        }

        if (targetNode && ts.isCallExpression(targetNode)) {
            // forwardRef call check
            if (
                ts.isIdentifier(targetNode.expression) &&
                targetNode.expression.text === 'forwardRef'
            ) {
                const arrowFunction = targetNode.arguments[0];
                if (ts.isArrowFunction(arrowFunction) || ts.isFunctionExpression(arrowFunction)) {
                    const defaultElement = findDefaultElementInFunction(arrowFunction);
                    if (defaultElement) {
                        return defaultElement;
                    }
                }
            }
        }
    }

    return undefined;
}

/**
 * Extracts Props and Ref types from ForwardRefExoticComponent
 */
function extractForwardRefTypes(
    checker: ts.TypeChecker,
    type: ts.Type,
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
 * Processes export specifier to extract target symbol and type information
 */
export function processExportSpecifier(
    checker: ts.TypeChecker,
    exportDeclaration: ts.ExportSpecifier,
): { targetSymbol: ts.Symbol; type: ts.Type } | undefined {
    // Skip re-exports e.g., export { Button } from './Button';
    if (isReExport(exportDeclaration)) {
        return;
    }

    const targetSymbol = checker.getExportSpecifierLocalTargetSymbol(exportDeclaration);

    if (!targetSymbol) {
        return;
    }

    let type: ts.Type;
    if (targetSymbol.declarations?.length) {
        type = checker.getTypeAtLocation(targetSymbol.declarations[0]);
    } else {
        type = checker.getTypeOfSymbol(targetSymbol);
    }

    return { targetSymbol, type };
}

/**
 * Handles external package prop filtering
 */
export function shouldIncludeExternalProp(
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

        // Component file itself (current source file)
        if (declarationFileName === sourceFile.fileName) {
            return true;
        }

        // Base UI component d.ts files
        if (isBaseUIDeclaration(declarationFileName)) {
            return true;
        }

        // Project's own type definition files
        if (isProjectTypeDeclaration(declarationFileName)) {
            return true;
        }
    }

    return false;
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
 * Finds the default element within a component function
 */
function findDefaultElementInFunction(
    func: ts.ArrowFunction | ts.FunctionExpression,
): string | undefined {
    let defaultElement: string | undefined;

    const visit = (node: ts.Node) => {
        // useRender call pattern
        if (
            ts.isCallExpression(node) &&
            ts.isIdentifier(node.expression) &&
            node.expression.text === 'useRender'
        ) {
            const arg = node.arguments[0];
            if (ts.isObjectLiteralExpression(arg)) {
                const renderProp = arg.properties.find(
                    (prop) =>
                        ts.isPropertyAssignment(prop) &&
                        ts.isIdentifier(prop.name) &&
                        prop.name.text === 'render',
                );

                if (renderProp && ts.isPropertyAssignment(renderProp)) {
                    // render || <element /> pattern
                    if (
                        ts.isBinaryExpression(renderProp.initializer) &&
                        renderProp.initializer.operatorToken.kind === ts.SyntaxKind.BarBarToken
                    ) {
                        const rightSide = renderProp.initializer.right;
                        if (ts.isJsxElement(rightSide) || ts.isJsxSelfClosingElement(rightSide)) {
                            const tagName = ts.isJsxElement(rightSide)
                                ? rightSide.openingElement.tagName
                                : rightSide.tagName;

                            if (ts.isIdentifier(tagName)) {
                                const componentName = tagName.text;
                                if (componentName === 'Component') {
                                    // Dynamic component pattern
                                    const dynamicElement = findDynamicComponent(
                                        func,
                                        componentName,
                                    );
                                    if (dynamicElement) {
                                        defaultElement = dynamicElement;
                                    }
                                } else {
                                    defaultElement = componentName;
                                }
                            }
                        }
                    }
                }
            }
        }

        ts.forEachChild(node, visit);
    };

    visit(func);
    return defaultElement;
}

/**
 * Checks if export declaration is a re-export from another module
 */
export function isReExport(exportDeclaration: ts.ExportSpecifier): boolean {
    return (
        ts.isExportDeclaration(exportDeclaration.parent.parent) &&
        exportDeclaration.parent.parent.moduleSpecifier !== undefined
    );
}
/**
 * Checks if a declaration comes from Base UI components
 */
export function isBaseUIDeclaration(fileName: string): boolean {
    return (
        fileName.includes('node_modules/@base-ui-components/react/esm') &&
        fileName.endsWith('.d.ts')
    );
}

/**
 * Checks if a declaration comes from project's own type definitions
 */
export function isProjectTypeDeclaration(fileName: string): boolean {
    return (
        fileName.includes('packages/core/src') &&
        (fileName.endsWith('.ts') || fileName.endsWith('.tsx'))
    );
}

/**
 * Finds the CSS file associated with a component file
 */
export function findCssFile(program: ts.Program, componentFilePath: string): string | undefined {
    const dir = path.dirname(componentFilePath);
    const baseName = path.basename(componentFilePath, path.extname(componentFilePath));

    // For index.ts files, also check for sibling component files
    const possibleCssFiles = [
        path.join(dir, `${baseName}.css.ts`),
        path.join(dir, `${baseName}.styles.ts`),
        path.join(dir, `${baseName}.css.js`),
    ];

    // If this is an index.ts file, also check for CSS files with the directory name
    if (baseName === 'index') {
        const dirName = path.basename(dir);
        possibleCssFiles.push(path.join(dir, `${dirName}.css.ts`));
    }

    for (const cssFile of possibleCssFiles) {
        const cssSourceFile = program.getSourceFile(cssFile);
        if (cssSourceFile) {
            return cssFile;
        }
    }

    return undefined;
}

/**
 * Extracts default value for a prop from CSS defaultVariants
 */
export function extractDefaultValue(
    program: ts.Program,
    cssFilePath: string,
    propName: string,
): string | undefined {
    const cssSourceFile = program.getSourceFile(cssFilePath);
    if (!cssSourceFile) {
        return undefined;
    }

    const defaultVariants = findDefaultVariants(cssSourceFile);

    if (defaultVariants && defaultVariants[propName] !== undefined) {
        return String(defaultVariants[propName]);
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
 * Finds dynamic component selection patterns
 */
function findDynamicComponent(
    func: ts.ArrowFunction | ts.FunctionExpression,
    variableName: string,
): string | undefined {
    let dynamicElement: string | undefined;

    const visit = (node: ts.Node) => {
        // const Component = condition ? 'element1' : 'element2' pattern
        if (
            ts.isVariableDeclaration(node) &&
            ts.isIdentifier(node.name) &&
            node.name.text === variableName &&
            node.initializer
        ) {
            // Conditional expression (ternary operator)
            if (ts.isConditionalExpression(node.initializer)) {
                const whenFalse = node.initializer.whenFalse;
                // Default is the false case
                if (ts.isStringLiteral(whenFalse)) {
                    dynamicElement = whenFalse.text;
                }
            }
            // Simple assignment: const Component = 'div'
            else if (ts.isStringLiteral(node.initializer)) {
                dynamicElement = node.initializer.text;
            }
        }

        ts.forEachChild(node, visit);
    };

    visit(func);
    return dynamicElement;
}

/**
 * Finds defaultVariants object in a Vanilla Extract recipe
 */
function findDefaultVariants(
    sourceFile: ts.SourceFile,
): Record<string, string | number | boolean | null> | undefined {
    let defaultVariants: Record<string, string | number | boolean | null> | undefined;

    const visit = (node: ts.Node) => {
        // export const root = recipe({ ... }) pattern - only check root variable
        if (
            ts.isVariableDeclaration(node) &&
            node.name &&
            ts.isIdentifier(node.name) &&
            node.name.text === 'root' &&
            node.initializer &&
            ts.isCallExpression(node.initializer) &&
            ts.isIdentifier(node.initializer.expression) &&
            node.initializer.expression.text === 'recipe'
        ) {
            const arg = node.initializer.arguments[0];
            if (ts.isObjectLiteralExpression(arg)) {
                const defaultVariantsProp = arg.properties.find(
                    (prop) =>
                        ts.isPropertyAssignment(prop) &&
                        ts.isIdentifier(prop.name) &&
                        prop.name.text === 'defaultVariants',
                );

                if (defaultVariantsProp && ts.isPropertyAssignment(defaultVariantsProp)) {
                    defaultVariants = parseObjectLiteral(defaultVariantsProp.initializer);
                    return; // Stop visiting once we find the root defaultVariants
                }
            }
        }

        ts.forEachChild(node, visit);
    };

    visit(sourceFile);
    return defaultVariants;
}
/**
 * Parses an object literal expression into a plain JavaScript object
 */
function parseObjectLiteral(node: ts.Node): Record<string, string | number | boolean | null> {
    const result: Record<string, string | number | boolean | null> = {};

    if (ts.isObjectLiteralExpression(node)) {
        node.properties.forEach((prop) => {
            if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name)) {
                const key = prop.name.text;
                const value = getLiteralValue(prop.initializer);
                if (value !== undefined) {
                    result[key] = value;
                }
            }
        });
    }

    return result;
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

