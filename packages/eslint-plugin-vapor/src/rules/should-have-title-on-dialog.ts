import type { Rule } from 'eslint';
import type { ImportDeclaration } from 'estree';
import ts from 'typescript';

import { getSource } from '~/utils/get-source';
import { isJSXIdentifier, isJSXMemberExpression } from '~/utils/guard';

export const shouldHaveTitleOnDialogRule: Rule.RuleModule = {
    meta: {
        type: 'suggestion',
        docs: {
            description:
                'Enforce Dialog.Popup (and similar) to have accessible name via aria-label, aria-labelledby, or containing a Dialog.Title.',
        },
        fixable: undefined,
        messages: {
            'missing-title':
                "The '{{ namespace }}.{{ subcomponent }}' requires an <{{ namespace }}.Title> component or 'aria-label', 'aria-labelledby' prop for accessibility.",
        },
    },
    create(context) {
        const parserServices = context.sourceCode.parserServices;
        const checker = parserServices?.program?.getTypeChecker();

        const targetComponents = new Set(['Dialog', 'Popover', 'Sheet']);
        const popupNames = new Set(['Popup', 'PopupPrimitive']);
        const sourceToComponent = getSource(targetComponents);

        const importedNames = new Set<string>(); // import { Dialog }
        const namespaces = new Set<string>(); // import * as Vapor

        return {
            ImportDeclaration(node: ImportDeclaration) {
                const source = node.source.value as string;
                const targetComponent = sourceToComponent[source];

                if (targetComponent) {
                    node.specifiers.forEach((specifier) => {
                        if (
                            (specifier.type === 'ImportSpecifier' &&
                                specifier.imported.type === 'Identifier' &&
                                specifier.imported.name === targetComponent) ||
                            specifier.type === 'ImportDefaultSpecifier'
                        ) {
                            importedNames.add(specifier.local.name);
                        }
                    });
                }

                if (source === '@vapor-ui/core') {
                    node.specifiers.forEach((specifier) => {
                        if (
                            specifier.type === 'ImportSpecifier' &&
                            specifier.imported.type === 'Identifier' &&
                            targetComponents.has(specifier.imported.name)
                        ) {
                            importedNames.add(specifier.local.name);
                        }

                        if (specifier.type === 'ImportNamespaceSpecifier') {
                            namespaces.add(specifier.local.name);
                        }
                    });
                }
            },

            JSXElement(node) {
                const openingElement = node.openingElement;
                const nodeName = openingElement.name;
                let isTarget = false;
                let namespace = '';
                let subcomponent = '';

                if (!isJSXMemberExpression(nodeName) || !popupNames.has(nodeName.property.name))
                    return;

                if (isJSXIdentifier(nodeName.object) && importedNames.has(nodeName.object.name)) {
                    isTarget = true;
                    namespace = nodeName.object.name;
                    subcomponent = nodeName.property.name;
                }

                if (isJSXMemberExpression(nodeName.object)) {
                    const nsObject = nodeName.object.object;
                    const nsProperty = nodeName.object.property;

                    if (
                        isJSXIdentifier(nsObject) &&
                        namespaces.has(nsObject.name) &&
                        targetComponents.has(nsProperty.name)
                    ) {
                        isTarget = true;
                        namespace = nsProperty.name;
                        subcomponent = nodeName.property.name;
                    }
                }

                if (!isTarget) return;

                const hasAriaLabel = openingElement.attributes.some(
                    (attr) =>
                        attr.type === 'JSXAttribute' &&
                        (attr.name.name === 'aria-label' || attr.name.name === 'aria-labelledby'),
                );

                if (hasAriaLabel) return;

                if (parserServices && parserServices.esTreeNodeToTSNodeMap) {
                    const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node);
                    // Pass a new set for visited to avoid stale recursion state.
                    // Strict check for tsNode existence to prevent crash if mapping fails.
                    if (tsNode && hasDialogTitle(tsNode, checker, new Set())) return;
                }

                context.report({
                    node: openingElement,
                    messageId: 'missing-title',
                    data: { namespace, subcomponent },
                });
            },
        };
    },
};

// Global cache for component analysis results to avoid re-parsing
// Key: Component Symbol, Value: boolean (has Dialog.Title)
export const componentCache = new WeakMap<ts.Symbol, boolean>();

const getTagName = (node: ts.Node): ts.JsxTagNameExpression | undefined => {
    if (ts.isJsxElement(node)) return node.openingElement.tagName;
    if (ts.isJsxSelfClosingElement(node)) return node.tagName;
    return undefined;
};

/**
 * Checks if a given TS Node corresponds to Dialog.Title
 * STRICT CHECK: Only returns true for the actual Primitive Title component.
 * does NOT return true for wrappers.
 */
export const isDialogTitle = (node: ts.Node, checker: ts.TypeChecker | undefined): boolean => {
    // Handle JSX Element
    const tagName = getTagName(node);

    if (!tagName || !checker) return false;

    let symbol = checker.getSymbolAtLocation(tagName);
    if (!symbol) return false;

    if (symbol.flags & ts.SymbolFlags.Alias) {
        symbol = checker.getAliasedSymbol(symbol);
    }

    const declarations = symbol.getDeclarations();
    if (!declarations || declarations.length === 0) return false;

    // 2. Verify it is a Core Component named Title
    for (const decl of declarations) {
        const sourceFile = decl.getSourceFile();
        const fileName = sourceFile.fileName;

        if (fileName.includes('packages/core') || fileName.includes('@vapor-ui/core')) {
            const name = symbol.getName();

            if (name.includes('Title')) return true;
        }
    }

    return false;
};

/**
 * Deeply checks if a component contains Dialog.Title
 * Uses WeakMap caching to avoid re-analyzing the same component definition.
 */
export const hasDialogTitle = (
    node: ts.Node,
    checker: ts.TypeChecker | undefined,
    visited = new Set<ts.Symbol | ts.Node>(), // updated to support Node for Scope analysis
): boolean => {
    // 1. Direct Check (Is this Node <Dialog.Title>?)
    if (isDialogTitle(node, checker)) {
        return true;
    }

    // 2. Recursive check for children in the current JSX tree.
    // Also check Fragment children (e.g. <><Dialog.Title /></>)
    if (ts.isJsxElement(node) || ts.isJsxFragment(node)) {
        for (const child of node.children) {
            if (hasDialogTitle(child, checker, visited)) return true;
        }
    }

    // 3. Jump to Definition
    const tagName = getTagName(node);
    if (!tagName || !checker) return false;

    // Optimization: Skip HTML intrinsic elements.
    // In JSX, tags starting with a lowercase letter are treated as built-in elements (div, span, etc.).
    if (ts.isIdentifier(tagName) && /^[a-z]/.test(tagName.text)) {
        return false;
    }

    let symbol = checker.getSymbolAtLocation(tagName);
    if (!symbol) return false;

    if (symbol.flags & ts.SymbolFlags.Alias) {
        symbol = checker.getAliasedSymbol(symbol);
    }

    if (componentCache.has(symbol)) {
        return componentCache.get(symbol)!;
    }

    if (visited.has(symbol)) return false;
    visited.add(symbol);

    let foundTitle = false;
    const declarations = symbol.getDeclarations();

    if (declarations) {
        foundTitle = checkDeclarations(declarations, checker, visited);
    }

    visited.delete(symbol);
    componentCache.set(symbol, foundTitle);

    return foundTitle;
};

// Helper: Check definitions recursively
function checkDeclarations(
    declarations: ts.Node[],
    checker: ts.TypeChecker | undefined,
    visited: Set<ts.Symbol | ts.Node>,
): boolean {
    for (const decl of declarations) {
        // Traverse the body/initializer of the component
        const checkNode = (n: ts.Node): boolean => {
            if (hasDialogTitle(n, checker, visited)) return true;
            return n.forEachChild(checkNode) || false;
        };

        let body: ts.Node | undefined;

        if (ts.isVariableDeclaration(decl) && decl.initializer) {
            body = decl.initializer;
        }

        if (
            (ts.isFunctionDeclaration(decl) && decl.body) ||
            ts.isArrowFunction(decl) ||
            ts.isFunctionExpression(decl)
        ) {
            body = decl.body;
        }

        if (body && checkNode(body)) {
            return true;
        }
    }
    return false;
}
