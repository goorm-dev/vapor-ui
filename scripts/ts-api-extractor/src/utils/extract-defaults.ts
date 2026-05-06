import path from 'node:path';
import { type ImportSpecifier, type SourceFile, SyntaxKind } from 'ts-morph';

export type DefaultValues = Record<string, string>;

// ──────────────────────────────────────────────────────────────
// Import analysis utilities
// ──────────────────────────────────────────────────────────────

export function findImportPaths(sourceFile: SourceFile, extension: string): string[] {
    const seen = new Set<string>();

    for (const importDecl of sourceFile.getImportDeclarations()) {
        const modulePath = importDecl.getModuleSpecifierValue();

        if (modulePath.endsWith(extension)) {
            seen.add(modulePath);
        }
    }

    return [...seen];
}

export function findNamespaceImportName(sourceFile: SourceFile, modulePath: string): string | null {
    for (const importDecl of sourceFile.getImportDeclarations()) {
        if (importDecl.getModuleSpecifierValue() !== modulePath) continue;

        const namespaceImport = importDecl.getNamespaceImport();
        if (namespaceImport) return namespaceImport.getText();
    }

    return null;
}

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

interface VariantsTypeImport {
    typeName: string;
    resolvedPath: string;
}

export function findCssImports(sourceFile: SourceFile): CssImport[] {
    const fileDir = path.dirname(sourceFile.getFilePath());

    return findImportPaths(sourceFile, '.css').map((modulePath) => ({
        modulePath,
        resolvedPath: path.resolve(fileDir, `${modulePath}.ts`),
    }));
}

function isRecipeVariantsType(namedImport: ImportSpecifier): boolean {
    const symbol = namedImport.getSymbol();
    if (!symbol) return false;

    const typeAlias = symbol
        .getDeclarations()
        .find((declaration) => declaration.isKind(SyntaxKind.TypeAliasDeclaration));
    if (!typeAlias) return false;

    const typeNode = typeAlias.asKind(SyntaxKind.TypeAliasDeclaration)?.getTypeNode();
    if (!typeNode?.isKind(SyntaxKind.TypeReference)) return false;

    const typeRef = typeNode.asKind(SyntaxKind.TypeReference);
    const typeName = typeRef?.getTypeName();
    if (!typeName) return false;

    const typeSymbol = typeName.getSymbol();
    if (!typeSymbol || typeSymbol.getName() !== 'RecipeVariants') {
        return false;
    }

    const typeDecl = typeSymbol.getDeclarations()[0];
    return typeDecl?.getSourceFile().getFilePath().includes('@vanilla-extract/recipes') ?? false;
}

export function findVariantsTypeImports(sourceFile: SourceFile): VariantsTypeImport[] {
    const imports: VariantsTypeImport[] = [];
    const fileDir = path.dirname(sourceFile.getFilePath());

    for (const importDecl of sourceFile.getImportDeclarations()) {
        const modulePath = importDecl.getModuleSpecifierValue();
        if (!modulePath.endsWith('.css')) continue;

        for (const namedImport of importDecl.getNamedImports()) {
            if (isRecipeVariantsType(namedImport)) {
                imports.push({
                    typeName: namedImport.getName(),
                    resolvedPath: path.resolve(fileDir, `${modulePath}.ts`),
                });
            }
        }
    }

    return imports;
}

export function getRecipeNameFromVariantsType(
    cssFile: SourceFile,
    variantsTypeName: string,
): string | null {
    const typeAlias = cssFile.getTypeAlias(variantsTypeName);
    if (!typeAlias) return null;

    let recipeName: string | null = null;

    typeAlias.forEachDescendant((node) => {
        if (recipeName || !node.isKind(SyntaxKind.TypeQuery)) return;

        const expressionName = node.getExprName();
        recipeName = expressionName.getText();
    });

    return recipeName;
}

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

export function parseRecipeDefaultVariants(
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

export function getDefaultValuesForNamespace(
    sourceFile: SourceFile,
    namespaceName: string,
    declaredPropNames?: Set<string>,
): DefaultValues {
    const result: DefaultValues = {
        ...extractDestructuringDefaults(sourceFile, namespaceName, declaredPropNames),
    };

    const cssImports = findCssImports(sourceFile);
    for (const cssImport of cssImports) {
        const styleName = findNamespaceImportName(sourceFile, cssImport.modulePath);
        if (!styleName) continue;

        const recipeName = findRecipeUsageInComponent(sourceFile, namespaceName, styleName);
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

    const variantsImports = findVariantsTypeImports(sourceFile);
    for (const variantsImport of variantsImports) {
        const cssFile = sourceFile.getProject().getSourceFile(variantsImport.resolvedPath);
        if (!cssFile) continue;

        const recipeName = getRecipeNameFromVariantsType(cssFile, variantsImport.typeName);
        if (!recipeName) continue;

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
