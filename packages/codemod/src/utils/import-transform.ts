import type {
    API,
    ASTPath,
    Collection,
    Identifier,
    ImportDeclaration,
    ImportDefaultSpecifier,
    ImportNamespaceSpecifier,
    ImportSpecifier,
    JSXIdentifier,
    JSXMemberExpression,
} from 'jscodeshift';

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
 * Check if a component exists in the source package import
 */
export function hasComponentInPackage(
    root: Collection,
    j: API['jscodeshift'],
    componentName: string,
    packageName: string,
): boolean {
    const packageImport = root.find(j.ImportDeclaration, {
        source: { value: packageName },
    });

    return (
        packageImport.length > 0 &&
        (packageImport
            .at(0)
            .get()
            .value.specifiers?.some(
                (spec: ImportSpecifier) =>
                    spec.type === 'ImportSpecifier' && spec.imported.name === componentName,
            ) ??
            false)
    );
}

/**
 * Get the local import name of a component (considering aliases)
 * Returns the local name if found, undefined otherwise
 */
export function getLocalImportName(
    root: Collection,
    j: API['jscodeshift'],
    componentName: string,
    packageName: string,
): string | undefined {
    const packageImport = root.find(j.ImportDeclaration, {
        source: { value: packageName },
    });

    if (packageImport.length === 0) {
        return undefined;
    }

    const specifier = packageImport
        .at(0)
        .get()
        .value.specifiers?.find(
            (spec: ImportSpecifier) =>
                spec.type === 'ImportSpecifier' && spec.imported.name === componentName,
        );

    return specifier ? getLocalName(specifier, componentName) : undefined;
}

/**
 * Get the final import name for a component after migration
 * Useful for getting the actual name used in JSX (considering aliases)
 */
export function getFinalImportName(
    root: Collection,
    j: API['jscodeshift'],
    componentName: string,
    targetPackage: string,
): string {
    const targetImports = root.find(j.ImportDeclaration, {
        source: { value: targetPackage },
    });

    if (targetImports.length > 0) {
        const vaporImport = targetImports.at(0).get().value;
        const specifier = vaporImport.specifiers?.find(
            (spec: ImportSpecifier) =>
                spec.type === 'ImportSpecifier' && spec.imported.name === componentName,
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
    newComponentName: string,
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
                j.identifier(localName),
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
    packageName: string,
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
        const existingComponentSpec = targetImport.specifiers?.find(
            (spec) => spec.type === 'ImportSpecifier' && spec.imported.name === newComponentName,
        ) as ImportSpecifier | undefined;

        if (!existingComponentSpec) {
            const localName = getLocalName(targetSpecifier, oldComponentName);
            const hasAlias = localName !== oldComponentName;

            let newImportSpecifier: ImportSpecifier;
            if (hasAlias) {
                newImportSpecifier = j.importSpecifier(
                    j.identifier(newComponentName),
                    j.identifier(localName),
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
                newComponentName,
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

/**
 * Collect all import specifiers from a given source package
 * @param j - jscodeshift API
 * @param root = AST root collection
 * @param sourcePackage  - The source package to collect imports from
 * @returns Array of ImportSpecifier objects
 */

export const collectImportSpecifiersToMove = (
    j: API['jscodeshift'],
    root: Collection<File>,
    sourcePackage: string,
): ImportSpecifier[] => {
    const specifiersMap = new Map<string, ImportSpecifier>();

    root.find(j.ImportDeclaration, {
        source: { value: sourcePackage },
    }).forEach((importPath) => {
        (importPath.node as ImportDeclaration).specifiers?.forEach((specifier) => {
            if (specifier.type === 'ImportSpecifier') {
                const localName = specifier.local?.name as string;

                if (!specifiersMap.has(localName)) {
                    specifiersMap.set(localName, specifier);
                }
            }
        });
    });
    return Array.from(specifiersMap.values());
};

export const getUniqueSortedSpecifiers = (
    specifiers: (ImportSpecifier | ImportDefaultSpecifier | ImportNamespaceSpecifier)[],
): (ImportSpecifier | ImportDefaultSpecifier | ImportNamespaceSpecifier)[] => {
    const namedSpecifiersMap = new Map<string, ImportSpecifier>();
    const otherSpecifiers: (ImportDefaultSpecifier | ImportNamespaceSpecifier)[] = [];

    specifiers.forEach((specifier) => {
        if (specifier.type === 'ImportSpecifier') {
            const localName = specifier.local?.name as string;
            if (!namedSpecifiersMap.has(localName)) {
                namedSpecifiersMap.set(localName, specifier);
            }
        } else {
            otherSpecifiers.push(specifier);
        }
    });

    const sortedNamedSpecifiers = Array.from(namedSpecifiersMap.values()).sort((a, b) =>
        (a.imported.name as string).localeCompare(b.imported.name as string),
    );

    return [...sortedNamedSpecifiers, ...otherSpecifiers];
};

export const mergeIntoExistingImport = (
    targetImport: Collection<ImportDeclaration>,
    specifiersToMove: ImportSpecifier[],
) => {
    const targetImportPath = targetImport.at(0).get();

    const existingSpecifiers = targetImportPath.value.specifiers || [];

    const combinedSpecifiers = [...existingSpecifiers, ...specifiersToMove];

    const finalSpecifiers = getUniqueSortedSpecifiers(combinedSpecifiers);

    targetImportPath.value.specifiers = finalSpecifiers;
};

export const createNewImportDeclaration = (
    j: API['jscodeshift'],
    root: Collection<File>,
    targetPackage: string,
    specifiersToMove: ImportSpecifier[],
) => {
    const sortedSpecifiers = getUniqueSortedSpecifiers(specifiersToMove);

    const newImport = j.importDeclaration(sortedSpecifiers, j.literal(targetPackage));

    const lastImport = root.find(j.ImportDeclaration).at(-1);
    if (lastImport.size() > 0) {
        lastImport.insertAfter(newImport);
    } else {
        root.get().node.program.body.unshift(newImport);
    }
};

export const cleanUpSourcePackage = (
    j: API['jscodeshift'],
    root: Collection<File>,
    sourcePackage: string,
    specifiersToMove: ImportSpecifier[],
) => {
    const movedLocalNames = new Set<string>(
        specifiersToMove.map((spec) => spec.local?.name as string),
    );

    root.find(j.ImportDeclaration, {
        source: { value: sourcePackage },
    }).forEach((importPath) => {
        const remainingSpecifiers = (importPath.node as ImportDeclaration).specifiers?.filter(
            (specifier) => {
                if (specifier.type !== 'ImportSpecifier') {
                    return true;
                }
                return !movedLocalNames.has(specifier.local?.name as string);
            },
        );

        if (remainingSpecifiers && remainingSpecifiers.length > 0) {
            importPath.node.specifiers = remainingSpecifiers;
        } else {
            j(importPath).remove();
        }
    });
};

export const transformSpecifier = (
    j: API['jscodeshift'],
    specifiersToMove: ImportSpecifier[],
    renameMap: { [oldName: string]: ComponentRenameRule },
): ImportSpecifier[] => {
    if (Object.keys(renameMap).length === 0) {
        return specifiersToMove;
    }

    return specifiersToMove.map((specifier) => {
        const originalImportedName = specifier.imported.name as string;
        const rule = renameMap[originalImportedName];
        if (!rule || !rule.newImport) {
            return specifier;
        }
        const newImportedName = rule.newImport;
        const newImported: Identifier = j.identifier(newImportedName);
        let newLocal: Identifier;

        if (specifier.imported.name === specifier.local?.name) {
            newLocal = j.identifier(newImportedName);
        } else {
            newLocal = specifier.local as Identifier;
        }

        return j.importSpecifier(newImported, newLocal);
    });
};

export interface ComponentRenameRule {
    newImport: string;
    newJSX: string;
}

export const buildJsxTransformMap = (
    specifiersToMove: ImportSpecifier[],
    renameMap: { [oldName: string]: ComponentRenameRule },
): Map<string, string> => {
    const jsxMap = new Map<string, string>();

    specifiersToMove.forEach((specifier) => {
        const originalImportedName = specifier.imported.name as string;
        const rule = renameMap[originalImportedName];

        if (rule && rule.newJSX) {
            const localName = specifier.local?.name as string;
            jsxMap.set(localName, rule.newJSX);
        }
    });

    return jsxMap;
};

export function transformJsxUsage(
    j: API['jscodeshift'],
    root: Collection<File>,
    jsxMap: Map<string, string>,
) {
    root.find(j.JSXIdentifier, (node) => jsxMap.has(node.name)).forEach((jsxIdentifierPath) => {
        const newJsxName = jsxMap.get(jsxIdentifierPath.node.name)!;

        if (!newJsxName.includes('.')) {
            jsxIdentifierPath.replace(j.jsxIdentifier(newJsxName));
        } else {
            const parts = newJsxName.split('.');
            const [first, ...rest] = parts.map((part) => j.jsxIdentifier(part));
            const newAstNode = rest.reduce(
                (obj, prop) => j.jsxMemberExpression(obj, prop),
                first as JSXIdentifier | JSXMemberExpression,
            );

            jsxIdentifierPath.replace(newAstNode);
        }
    });
}

export const filterSpecifiersByMap = (
    allSpecifiers: ImportSpecifier[],
    renameMap: { [oldName: string]: ComponentRenameRule },
): ImportSpecifier[] => {
    const mapKeys = Object.keys(renameMap);
    return allSpecifiers.filter((spec) => mapKeys.includes(spec.imported.name as string));
};

export const buildAliasMap = (specifiersToMove: ImportSpecifier[]): Map<string, string> => {
    const aliasMap = new Map<string, string>();

    specifiersToMove.forEach((specifier) => {
        aliasMap.set(specifier.imported.name as string, specifier.local?.name as string);
    });
    return aliasMap;
};
