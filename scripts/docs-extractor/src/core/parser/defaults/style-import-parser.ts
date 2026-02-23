/**
 * Style import analysis module
 *
 * Extracts vanilla-extract style file imports (.css.ts) from component files.
 */
import path from 'node:path';
import { type ImportSpecifier, type SourceFile, SyntaxKind } from 'ts-morph';

import { findImportPaths } from '~/core/parser/utils';

const RECIPE_VARIANTS_TYPE_NAME = 'RecipeVariants';
const VANILLA_EXTRACT_RECIPES_PATH = '@vanilla-extract/recipes';

export interface CssImport {
    modulePath: string;
    resolvedPath: string;
}

export interface VariantsTypeImport {
    typeName: string;
    modulePath: string;
    resolvedPath: string;
}

/**
 * Find all .css file imports from a component file.
 */
export function findCssImports(sourceFile: SourceFile): CssImport[] {
    const fileDir = path.dirname(sourceFile.getFilePath());

    return findImportPaths(sourceFile, '.css').map((modulePath) => ({
        modulePath,
        resolvedPath: path.resolve(fileDir, `${modulePath}.ts`),
    }));
}

/**
 * Check if a named import resolves to a RecipeVariants<T> type.
 *
 * Traces the type alias to its original definition and verifies
 * it uses RecipeVariants from @vanilla-extract/recipes.
 */
function isRecipeVariantsType(namedImport: ImportSpecifier): boolean {
    const symbol = namedImport.getSymbol();
    if (!symbol) return false;

    // Find the type alias declaration in the source file
    const typeAlias = symbol
        .getDeclarations()
        .find((d) => d.isKind(SyntaxKind.TypeAliasDeclaration));
    if (!typeAlias) return false;

    // Get the type node (right-hand side: RecipeVariants<typeof x>)
    const typeNode = typeAlias.asKind(SyntaxKind.TypeAliasDeclaration)?.getTypeNode();
    if (!typeNode?.isKind(SyntaxKind.TypeReference)) return false;

    // Extract the type name from the reference
    const typeRef = typeNode.asKind(SyntaxKind.TypeReference);
    const typeName = typeRef?.getTypeName();
    if (!typeName) return false;

    // Resolve the symbol and verify it's RecipeVariants
    const typeSymbol = typeName.getSymbol();
    if (!typeSymbol || typeSymbol.getName() !== RECIPE_VARIANTS_TYPE_NAME) {
        return false;
    }

    // Verify the symbol originates from @vanilla-extract/recipes
    const typeDecl = typeSymbol.getDeclarations()[0];
    return typeDecl?.getSourceFile().getFilePath().includes(VANILLA_EXTRACT_RECIPES_PATH) ?? false;
}

/**
 * Find type imports from .css files that are RecipeVariants types.
 */
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
                    modulePath,
                    resolvedPath: path.resolve(fileDir, `${modulePath}.ts`),
                });
            }
        }
    }

    return imports;
}
