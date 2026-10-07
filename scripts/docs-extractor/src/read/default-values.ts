import path from 'node:path';
import { type SourceFile, SyntaxKind, type VariableDeclaration } from 'ts-morph';

type DefaultValues = Record<string, string>;

// ──────────────────────────────────────────────────────────────
// Import analysis utilities
// ──────────────────────────────────────────────────────────────

function findImportPaths(sourceFile: SourceFile, extension: string): string[] {
    const seen = new Set<string>();

    for (const importDecl of sourceFile.getImportDeclarations()) {
        const modulePath = importDecl.getModuleSpecifierValue();

        if (modulePath.endsWith(extension)) {
            seen.add(modulePath);
        }
    }

    return [...seen];
}

function findNamespaceImportName(sourceFile: SourceFile, modulePath: string): string | null {
    for (const importDecl of sourceFile.getImportDeclarations()) {
        if (importDecl.getModuleSpecifierValue() !== modulePath) continue;

        const namespaceImport = importDecl.getNamespaceImport();
        if (namespaceImport) return namespaceImport.getText();
    }

    return null;
}

function extractDestructuringDefaults(
    componentImplementation: VariableDeclaration,
    declaredPropNames?: Set<string>,
): DefaultValues {
    const result: DefaultValues = {};

    const initializer = componentImplementation.getInitializer();
    if (!initializer) return result;

    initializer.forEachDescendant((node) => {
        if (!node.isKind(SyntaxKind.BindingElement)) return;

        const initNode = node.getInitializer();
        if (!initNode) return;

        const nameNode = node.getNameNode();
        if (!nameNode.isKind(SyntaxKind.Identifier)) return;

        const propertyNameNode = node.getPropertyNameNode();
        const name = propertyNameNode?.isKind(SyntaxKind.Identifier)
            ? propertyNameNode.getText()
            : propertyNameNode?.isKind(SyntaxKind.StringLiteral)
              ? propertyNameNode.getLiteralText()
              : nameNode.getText();

        if (declaredPropNames && !declaredPropNames.has(name)) return;
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

interface CssImport {
    modulePath: string;
    resolvedPath: string;
}

function findCssImports(sourceFile: SourceFile): CssImport[] {
    const fileDir = path.dirname(sourceFile.getFilePath());

    return findImportPaths(sourceFile, '.css').map((modulePath) => ({
        modulePath,
        resolvedPath: path.resolve(fileDir, `${modulePath}.ts`),
    }));
}

function findRecipeUsageInComponent(
    componentImplementation: VariableDeclaration,
    styleName: string,
): string | null {
    const initializer = componentImplementation.getInitializer();
    if (!initializer) return null;

    let foundRecipe: string | null = null;

    initializer.forEachDescendant((node) => {
        if (foundRecipe || !node.isKind(SyntaxKind.CallExpression)) return;

        const expr = node.getExpression();
        if (!expr.isKind(SyntaxKind.PropertyAccessExpression)) return;

        const objectName = expr.getExpression().getText();
        if (objectName === styleName) {
            foundRecipe = expr.getName();
        }
    });

    return foundRecipe;
}

function parseRecipeDefaultVariants(
    cssFile: SourceFile,
    variableName: string,
): DefaultValues | null {
    const variableDecl = cssFile.getVariableDeclaration(variableName);
    if (!variableDecl) return null;

    const callExpr = variableDecl.getInitializerIfKind(SyntaxKind.CallExpression);
    if (!callExpr) return null;

    const callee = callExpr.getExpression().getText();
    if (callee !== 'recipe' && callee !== 'componentRecipe') return null;

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
        if (!prop.isKind(SyntaxKind.PropertyAssignment)) return;

        const key = prop.getName();
        const value = prop.getInitializer()?.getText().replace(/['"`]/g, '') || '';
        result[key] = value;
    });

    return result;
}

export function getDefaultValuesForComponent(
    sourceFile: SourceFile,
    componentImplementation: VariableDeclaration | undefined,
    declaredPropNames?: Set<string>,
): DefaultValues {
    if (!componentImplementation) return {};

    const result: DefaultValues = {
        ...extractDestructuringDefaults(componentImplementation, declaredPropNames),
    };

    const cssImports = findCssImports(sourceFile);
    for (const cssImport of cssImports) {
        const styleName = findNamespaceImportName(sourceFile, cssImport.modulePath);
        if (!styleName) continue;

        const recipeName = findRecipeUsageInComponent(componentImplementation, styleName);
        if (!recipeName) continue;

        const cssFile = sourceFile.getProject().getSourceFile(cssImport.resolvedPath);
        if (!cssFile) continue;

        const defaults = parseRecipeDefaultVariants(cssFile, recipeName);
        if (!defaults) continue;

        for (const [key, value] of Object.entries(defaults)) {
            if (!(key in result)) {
                result[key] = value;
            }
        }
    }

    return result;
}
