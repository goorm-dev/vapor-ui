import type { API, ASTPath, Collection, ImportDeclaration, ImportSpecifier } from 'jscodeshift';

export interface ComponentImportInfo {
    /** The local name of the component (could be aliased) */
    localName: string;
    /** The original imported name */
    importedName: string;
    /** Whether the component was found in the source package */
    found: boolean;
}
/**
 * Get the local name from an import specifier (considering aliases)
 */
function getLocalName(specifier: ImportSpecifier, importedName: string): string {
    return (specifier.local?.name as string) || importedName;
}

/**
 * Get the final import name for a component after migration
 * Useful for getting the actual name used in JSX (considering aliases)
 */
export function getFinalImportName(
    root: Collection,
    j: API['jscodeshift'],
    componentName: string,
    targetPackage: string
): string {
    const targetImports = root.find(j.ImportDeclaration, {
        source: { value: targetPackage },
    });

    if (targetImports.length > 0) {
        const vaporImport = targetImports.at(0).get().value;
        const specifier = vaporImport.specifiers?.find(
            (spec: ImportSpecifier) =>
                spec.type === 'ImportSpecifier' && spec.imported.name === componentName
        ) as ImportSpecifier | undefined;

        if (specifier) {
            return getLocalName(specifier, componentName);
        }
    }

    return componentName;
}

/**
 * Case 1: Simple package migration
 * Replaces the entire import statement from source to target package
 * Example: import { Button } from 'A' -> import { Button } from 'B'
 */
function handleSimplePackageMigration(
    j: API['jscodeshift'],
    path: ASTPath<ImportDeclaration>,
    sourcePackage: string,
    targetPackage: string,
    oldComponentName: string,
    newComponentName: string
): boolean {
    const importDeclaration = path.value;
    if (importDeclaration.source.value === sourcePackage) {
        importDeclaration.source.value = targetPackage;

        if (oldComponentName !== newComponentName && importDeclaration.specifiers) {
            importDeclaration.specifiers = importDeclaration.specifiers.map((spec) => {
                if (spec.type === 'ImportSpecifier' && spec.imported.name === oldComponentName) {
                    return j.importSpecifier(j.identifier(newComponentName));
                }
                return spec;
            });
        }

        return true;
    }
    return false;
}

const handleSplitComponentImports = ({
    j,
    importDeclarationFromSourcePackage,
    targetPackage,
    oldComponentName,
    newComponentName,
}: {
    j: API['jscodeshift'];
    importDeclarationFromSourcePackage: ASTPath<ImportDeclaration>;
    targetPackage: string;
    oldComponentName: string;
    newComponentName: string;
}) => {
    const importDeclaration = importDeclarationFromSourcePackage.value;
    let targetSpecifier: ImportSpecifier | null = null;
    const otherSpecifiers: typeof importDeclaration.specifiers = [];
    for (const specifier of importDeclaration.specifiers || []) {
        if (specifier.type === 'ImportSpecifier' && specifier.imported.name === oldComponentName) {
            targetSpecifier = specifier;
        } else {
            otherSpecifiers.push(specifier);
        }
    }

    if (targetSpecifier) {
        importDeclaration.specifiers = otherSpecifiers;

        const localName = getLocalName(targetSpecifier, oldComponentName);
        const hasAlias = localName !== oldComponentName;

        let newImportSpecifier: ImportSpecifier;
        if (hasAlias) {
            newImportSpecifier = j.importSpecifier(
                j.identifier(newComponentName),
                j.identifier(localName)
            );
        } else {
            newImportSpecifier = j.importSpecifier(j.identifier(newComponentName));
        }

        const newImport = j.importDeclaration([newImportSpecifier], j.literal(targetPackage));

        importDeclarationFromSourcePackage.insertAfter(newImport);
    }
};

/**
 * Find existing import declaration for a given package
 * Returns the ASTPath of the import declaration or null if not found
 * @param {import('jscodeshift').Collection} root
 * jscodeshift Collection representing the AST root
 * @param {import('jscodeshift').API['jscodeshift']
 * j} j
 * jscodeshift API
 * @param {string} packageName
 * The package name to search for
 * @returns {import('jscodeshift').ASTPath<import('jscodeshift').ImportDeclaration> | null}
 * The ASTPath of the found import declaration or null
 */
function findExistingPackageImport(
    root: Collection,
    j: API['jscodeshift'],
    packageName: string
): ASTPath<ImportDeclaration> | null {
    const imports = root.find(j.ImportDeclaration, {
        source: { type: 'StringLiteral', value: packageName },
    });
    if (imports.length > 0) {
        return imports.at(0).get();
    }
    return null;
}

/**
 * Get the count of import specifiers in an import declaration
 * returns the total number of imported items
 *
 * E.g.: import React, { useState, useEffect } from 'react';
 * -> [ImportDefaultSpecifier, ImportSpecifier, ImportSpecifier]
 * -> Count: 3
 *
 * @param {import('jscodeshift').ASTPath<import('jscodeshift').ImportDeclaration>} importDeclaration
 * jscodeshift ASTPath representing the import declaration
 * @returns {number} the total number of imported items in the line
 */
function getImportSpecifierCount(importDeclaration: ASTPath<ImportDeclaration>): number {
    return importDeclaration.value.specifiers ? importDeclaration.value.specifiers.length : 0;
}

const handleMergeComponentImports = ({
    j,
    importDeclarationFromSourcePackage,
    importDeclarationFromTargetPackage,
    oldComponentName,
    newComponentName,
}: {
    j: API['jscodeshift'];
    importDeclarationFromSourcePackage: ASTPath<ImportDeclaration>;
    importDeclarationFromTargetPackage: ASTPath<ImportDeclaration>;
    oldComponentName: string;
    newComponentName: string;
}) => {
    const sourceImport = importDeclarationFromSourcePackage.value;
    const targetImport = importDeclarationFromTargetPackage.value;
    let targetSpecifier: ImportSpecifier | null = null;
    const otherSpecifiers: typeof sourceImport.specifiers = [];
    for (const specifier of sourceImport.specifiers || []) {
        if (specifier.type === 'ImportSpecifier' && specifier.imported.name === oldComponentName) {
            targetSpecifier = specifier;
        } else {
            otherSpecifiers.push(specifier);
        }
    }

    if (otherSpecifiers.length === 0) {
        j(importDeclarationFromSourcePackage).remove();
    } else {
        sourceImport.specifiers = otherSpecifiers;
    }

    if (targetSpecifier) {
        const hasComponentImport = targetImport.specifiers?.some(
            (spec) => spec.type === 'ImportSpecifier' && spec.imported.name === newComponentName
        );

        if (!hasComponentImport) {
            const localName = getLocalName(targetSpecifier, oldComponentName);
            const hasAlias = localName !== oldComponentName;

            let newImportSpecifier: ImportSpecifier;
            if (hasAlias) {
                newImportSpecifier = j.importSpecifier(
                    j.identifier(newComponentName),
                    j.identifier(localName)
                );
            } else {
                newImportSpecifier = j.importSpecifier(j.identifier(newComponentName));
            }
            targetImport.specifiers?.push(newImportSpecifier);
        }
    }
};

export const transformImportDeclaration = ({
    root,
    j,
    oldComponentName,
    newComponentName,
    sourcePackage,
    targetPackage,
}: {
    root: Collection;
    j: API['jscodeshift'];
    oldComponentName: string;
    newComponentName: string;
    sourcePackage: string;
    targetPackage: string;
}) => {
    const importDeclarationFromSourcePackage = findExistingPackageImport(root, j, sourcePackage);
    const importDeclarationFromTargetPackage = findExistingPackageImport(root, j, targetPackage);

    if (!importDeclarationFromSourcePackage) {
        return;
    }

    const sourceImportCount = getImportSpecifierCount(importDeclarationFromSourcePackage);

    if (importDeclarationFromTargetPackage === null) {
        if (sourceImportCount === 1) {
            handleSimplePackageMigration(
                j,
                importDeclarationFromSourcePackage,
                sourcePackage,
                targetPackage,
                oldComponentName,
                newComponentName
            );
        } else {
            handleSplitComponentImports({
                j,
                importDeclarationFromSourcePackage,
                targetPackage,
                oldComponentName,
                newComponentName,
            });
        }
    } else {
        handleMergeComponentImports({
            j,
            importDeclarationFromSourcePackage,
            importDeclarationFromTargetPackage,
            oldComponentName,
            newComponentName,
        });
    }
};
