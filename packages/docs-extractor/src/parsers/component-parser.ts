import ts from 'typescript';

import type { ComponentTypeInfo } from '~/types/types';
import { getJSDocDescription, isReactReturnType } from '~/utils';

import { extractProps, extractPropsType } from './props-parser';

/**
 * Component parsing utilities
 * Handles React component analysis and extraction
 */

/**
 * Creates component type information from symbol and type data
 */
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
 * Extracts the display name from a component symbol
 */
export function extractDisplayName(symbol: ts.Symbol): string | undefined {
    const declarations = symbol.getDeclarations();
    if (!declarations) return undefined;

    for (const decl of declarations) {
        const sourceFile = decl.getSourceFile();
        const text = sourceFile.getFullText();
        const symbolName = symbol.getName();

        // Component.displayName = 'ComponentName' pattern
        const displayNamePattern = new RegExp(
            `${symbolName}\\.displayName\\s*=\\s*['"]([^'"]+)['"]`,
        );
        const match = text.match(displayNamePattern);

        if (match) {
            return match[1];
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
