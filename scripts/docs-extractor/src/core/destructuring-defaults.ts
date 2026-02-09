/**
 * Destructuring defaults extraction module
 *
 * Extracts default values from destructuring patterns in component function bodies.
 * e.g. const { size = 'md', disabled = false } = resolveStyles(props);
 */
import { type SourceFile, SyntaxKind } from 'ts-morph';

import type { DefaultValues } from './default-variants';

/**
 * Extracts destructuring default values from component function body.
 *
 * Detects patterns like:
 *   const { side = 'bottom', align = 'start', sideOffset = 4 } = resolveStyles(props);
 *   const { closeOnClickOverlay = true, ...rest } = props;
 *
 * Only includes defaults for properties that exist in the given declaredPropNames set,
 * preventing false positives from internal variables.
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

        const name = nameNode.getText();

        // Skip if not declared in Props interface (prevents picking up internal variable defaults)
        if (declaredPropNames && !declaredPropNames.has(name)) return;

        // Skip if already found (first occurrence wins)
        if (name in result) return;

        const rawValue = initNode.getText();
        // Clean up: remove quotes, convert boolean/number literals as-is
        result[name] = rawValue.replace(/^['"`]|['"`]$/g, '');
    });

    return result;
}
