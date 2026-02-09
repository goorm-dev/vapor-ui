/**
 * Default values extraction module
 *
 * Extracts default values for component props from multiple sources:
 * 1. Recipes directly used by the component (tracking styles.root() calls)
 * 2. Variants type extended by the props interface (ButtonVariants → button recipe)
 * 3. Destructuring defaults from component function body
 */
import { type SourceFile, SyntaxKind } from 'ts-morph';

import { findNamespaceImportName } from '~/utils/module';

import { extractDestructuringDefaults } from './destructuring-defaults';
import { findCssImports, findVariantsTypeImports } from './style-imports';

export type DefaultValues = Record<string, string>;

/**
 * Extracts the original recipe variable name from a Variants type in a CSS file.
 * e.g. type ButtonVariants = NonNullable<RecipeVariants<typeof root>> → "root"
 */
export function getRecipeNameFromVariantsType(
    cssFile: SourceFile,
    variantsTypeName: string,
): string | null {
    const typeAlias = cssFile.getTypeAlias(variantsTypeName);
    if (!typeAlias) return null;

    // Find 'typeof XXX' pattern and extract variable name
    let recipeName: string | null = null;

    typeAlias.forEachDescendant((node) => {
        if (recipeName) return;

        if (node.isKind(SyntaxKind.TypeQuery)) {
            // Extract identifier from the expression after 'typeof'
            const expressionName = node.getExprName();
            recipeName = expressionName.getText();
        }
    });

    return recipeName;
}

/**
 * Phase 2: Finds recipes used within a specific component function.
 * e.g. Finding styles.root() calls inside const TabsRoot = forwardRef(...)
 */
export function findRecipeUsageInComponent(
    sourceFile: SourceFile,
    componentName: string,
    styleName: string,
): string | null {
    // 1. Find variable declaration by componentName (const TabsRoot = forwardRef(...))
    const componentVar = sourceFile.getVariableDeclaration(componentName);
    if (!componentVar) return null;

    // 2. Search only within the variable's initializer (forwardRef call)
    const initializer = componentVar.getInitializer();
    if (!initializer) return null;

    // 3. Find styles.xxx() calls
    let foundRecipe: string | null = null;

    initializer.forEachDescendant((node) => {
        if (foundRecipe) return; // Use only the first match

        if (node.isKind(SyntaxKind.CallExpression)) {
            const expr = node.getExpression();
            // Check for styles.root(...) pattern
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
 * Phase 3 & 4: Parses defaultVariants from a specific recipe in a CSS file.
 * e.g. export const root = recipe({ defaultVariants: { size: 'md' } })
 */
export function parseRecipeDefaultVariants(
    cssFile: SourceFile,
    variableName: string,
): DefaultValues | null {
    // 1. Find variable declaration
    const variableDecl = cssFile.getVariableDeclaration(variableName);
    if (!variableDecl) return null;

    // 2. Check if it's a recipe() call
    const callExpr = variableDecl.getInitializerIfKind(SyntaxKind.CallExpression);
    if (!callExpr) return null;

    const callee = callExpr.getExpression().getText();
    if (callee !== 'recipe') return null;

    // 3. Get config object
    const configObject = callExpr.getArguments()[0]?.asKind(SyntaxKind.ObjectLiteralExpression);
    if (!configObject) return null;

    // 4. Find defaultVariants property
    const defaultVariantsProperty = configObject.getProperty('defaultVariants');
    if (!defaultVariantsProperty) return null;

    const defaultVariantsValue = defaultVariantsProperty
        .asKind(SyntaxKind.PropertyAssignment)
        ?.getInitializerIfKind(SyntaxKind.ObjectLiteralExpression);

    if (!defaultVariantsValue) return null;

    // 5. Extract values
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
 * Phase 5: Extracts defaultVariants for a namespace.
 *
 * Collects defaultVariants from three sources:
 * 1. Destructuring defaults from component function body (lowest priority)
 * 2. Recipes directly used by the component (styles.root() calls)
 * 3. Original recipes from imported Variants types (ButtonVariants → button recipe)
 *
 * Recipe defaults override destructuring defaults when both exist.
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

        // Extract recipe variable name referenced by typeof in Variants type
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
