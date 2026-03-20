/**
 * Destructuring defaults extraction module
 *
 * Extracts default values from destructuring patterns in component function bodies.
 */
import { type SourceFile, SyntaxKind } from 'ts-morph';

import type { DefaultValues } from './variant-parser';

/**
 * Extract destructuring default values from component function body.
 */
export function extractDestructuringDefaults(
    sourceFile: SourceFile,
    componentName: string,
    declaredPropNames?: Set<string>,
): DefaultValues {
    const result: DefaultValues = {};

    const componentVar = sourceFile.getVariableDeclaration(componentName);
    if (!componentVar) return result;

    const initializer = componentVar.getInitializer();
    if (!initializer) return result;

    initializer.forEachDescendant((node) => {
        if (!node.isKind(SyntaxKind.BindingElement)) return;

        const initNode = node.getInitializer();
        if (!initNode) return;

        const nameNode = node.getNameNode();
        if (!nameNode.isKind(SyntaxKind.Identifier)) return;

        const propertyNameNode = node.getPropertyNameNode();
        const name =
            propertyNameNode?.isKind(SyntaxKind.Identifier)
                ? propertyNameNode.getText()
                : propertyNameNode?.isKind(SyntaxKind.StringLiteral)
                  ? propertyNameNode.getLiteralText()
                  : nameNode.getText();

        // Skip if not declared in Props interface
        if (declaredPropNames && !declaredPropNames.has(name)) return;

        // Skip if already found (first occurrence wins)
        if (name in result) return;

        if (
            initNode.isKind(SyntaxKind.StringLiteral) ||
            initNode.isKind(SyntaxKind.NoSubstitutionTemplateLiteral)
        ) {
            result[name] = initNode.getLiteralText();
            return;
        }

        result[name] = initNode.getText();
    });

    return result;
}
