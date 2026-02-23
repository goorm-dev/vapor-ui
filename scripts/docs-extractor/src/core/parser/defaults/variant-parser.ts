/**
 * Variant default value extraction module
 *
 * Extracts default values from recipe() calls and Variants types.
 */
import { type SourceFile, SyntaxKind } from 'ts-morph';

import { findNamespaceImportName } from '~/core/parser/utils';

import { extractDestructuringDefaults } from './destructuring-parser';
import { findCssImports, findVariantsTypeImports } from './style-import-parser';

export type DefaultValues = Record<string, string>;

/**
 * Extract recipe variable name from Variants type in CSS file.
 */
export function getRecipeNameFromVariantsType(
    cssFile: SourceFile,
    variantsTypeName: string,
): string | null {
    const typeAlias = cssFile.getTypeAlias(variantsTypeName);
    if (!typeAlias) return null;

    let recipeName: string | null = null;

    typeAlias.forEachDescendant((node) => {
        if (recipeName) return;

        if (node.isKind(SyntaxKind.TypeQuery)) {
            const expressionName = node.getExprName();
            recipeName = expressionName.getText();
        }
    });

    return recipeName;
}

/**
 * Find recipes used within a specific component function.
 */
export function findRecipeUsageInComponent(
    sourceFile: SourceFile,
    componentName: string,
    styleName: string,
): string | null {
    const componentVar = sourceFile.getVariableDeclaration(componentName);
    if (!componentVar) return null;

    const initializer = componentVar.getInitializer();
    if (!initializer) return null;

    let foundRecipe: string | null = null;

    initializer.forEachDescendant((node) => {
        if (foundRecipe) return;

        if (node.isKind(SyntaxKind.CallExpression)) {
            const expr = node.getExpression();
            if (expr.isKind(SyntaxKind.PropertyAccessExpression)) {
                const obj = expr.getExpression().getText();
                if (obj === styleName) {
                    foundRecipe = expr.getName();
                }
            }
        }
    });

    return foundRecipe;
}

/**
 * Parse defaultVariants from a specific recipe in CSS file.
 */
export function parseRecipeDefaultVariants(
    cssFile: SourceFile,
    variableName: string,
): DefaultValues | null {
    const variableDecl = cssFile.getVariableDeclaration(variableName);
    if (!variableDecl) return null;

    const callExpr = variableDecl.getInitializerIfKind(SyntaxKind.CallExpression);
    if (!callExpr) return null;

    const callee = callExpr.getExpression().getText();
    if (callee !== 'recipe') return null;

    const configObject = callExpr.getArguments()[0]?.asKind(SyntaxKind.ObjectLiteralExpression);
    if (!configObject) return null;

    const defaultVariantsProperty = configObject.getProperty('defaultVariants');
    if (!defaultVariantsProperty) return null;

    const defaultVariantsValue = defaultVariantsProperty
        .asKind(SyntaxKind.PropertyAssignment)
        ?.getInitializerIfKind(SyntaxKind.ObjectLiteralExpression);

    if (!defaultVariantsValue) return null;

    const result: DefaultValues = {};
    defaultVariantsValue.getProperties().forEach((prop) => {
        if (prop.isKind(SyntaxKind.PropertyAssignment)) {
            const key = prop.getName();
            const value = prop.getInitializer()?.getText().replace(/['"`]/g, '') || '';
            result[key] = value;
        }
    });

    return result;
}

/**
 * Extract defaultVariants for a namespace from multiple sources.
 */
export function getDefaultValuesForNamespace(
    sourceFile: SourceFile,
    namespaceName: string,
    declaredPropNames?: Set<string>,
): DefaultValues {
    // Start with destructuring defaults (lowest priority)
    const result: DefaultValues = {
        ...extractDestructuringDefaults(sourceFile, namespaceName, declaredPropNames),
    };

    // === Method 1: Extract from directly used recipes ===
    const cssImports = findCssImports(sourceFile);
    for (const imp of cssImports) {
        const styleName = findNamespaceImportName(sourceFile, imp.modulePath);
        if (!styleName) continue;

        const recipeName = findRecipeUsageInComponent(sourceFile, namespaceName, styleName);
        if (!recipeName) continue;

        const cssFile = sourceFile.getProject().getSourceFile(imp.resolvedPath);
        if (!cssFile) continue;

        const defaults = parseRecipeDefaultVariants(cssFile, recipeName);
        if (defaults) {
            for (const [key, value] of Object.entries(defaults)) {
                if (!(key in result)) {
                    result[key] = value;
                }
            }
        }
    }

    // === Method 2: Extract from Variants type imports ===
    const variantsImports = findVariantsTypeImports(sourceFile);
    for (const varImp of variantsImports) {
        const cssFile = sourceFile.getProject().getSourceFile(varImp.resolvedPath);
        if (!cssFile) continue;

        const recipeName = getRecipeNameFromVariantsType(cssFile, varImp.typeName);
        if (!recipeName) continue;

        const defaults = parseRecipeDefaultVariants(cssFile, recipeName);

        if (defaults) {
            for (const [key, value] of Object.entries(defaults)) {
                if (!(key in result)) {
                    result[key] = value;
                }
            }
        }
    }

    return result;
}
