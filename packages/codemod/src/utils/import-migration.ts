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
 * Migrate a component import from source package to target package
 * Supports both default imports and named imports
 * Returns information about the component's local name (for alias support)
 */
export function migrateImportSpecifier(
    root: Collection,
    j: API['jscodeshift'],
    path: ASTPath<ImportDeclaration>,
    componentName: string,
    sourcePackage: string,
    targetPackage: string
): ComponentImportInfo | null {
    const importDeclaration = path.value;
    let componentInfo: ComponentImportInfo | null = null;

    if (importDeclaration.source.value === sourcePackage) {
        const otherSpecifiers: typeof importDeclaration.specifiers = [];

        importDeclaration.specifiers?.forEach((specifier) => {
            if (specifier.type === 'ImportSpecifier' && specifier.imported.name === componentName) {
                componentInfo = {
                    localName: (specifier.local?.name as string) || componentName,
                    importedName: componentName,
                    found: true,
                };
            } else {
                otherSpecifiers.push(specifier);
            }
        });

        if (componentInfo) {
            if (otherSpecifiers.length === 0) {
                // Replace the entire import
                importDeclaration.source.value = targetPackage;
                importDeclaration.specifiers = [j.importSpecifier(j.identifier(componentName))];
            } else {
                // Keep other specifiers, add new component import
                importDeclaration.specifiers = otherSpecifiers;

                const allTargetImports = root.find(j.ImportDeclaration, {
                    source: { value: targetPackage },
                });

                if (allTargetImports.length > 0) {
                    const firstImport = allTargetImports.at(0).get().value;
                    const hasComponentImport = firstImport.specifiers?.some(
                        (spec: ImportSpecifier) =>
                            spec.type === 'ImportSpecifier' && spec.imported.name === componentName
                    );

                    if (!hasComponentImport) {
                        firstImport.specifiers?.push(
                            j.importSpecifier(j.identifier(componentName))
                        );
                    }
                    // Note: Don't merge imports here - use mergeImports() separately after all migrations
                } else {
                    const componentImport = j.importDeclaration(
                        [j.importSpecifier(j.identifier(componentName))],
                        j.literal(targetPackage)
                    );

                    path.insertAfter(componentImport);
                }
            }

            return componentInfo;
        }
    }

    return null;
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
            return (specifier.local?.name as string) || componentName;
        }
    }

    return componentName;
}

/**
 * Migrate and rename a component import from source package to target package
 * Returns information about the component's local name (for alias support)
 */
export function migrateAndRenameImport(
    root: Collection,
    j: API['jscodeshift'],
    path: ASTPath<ImportDeclaration>,
    oldComponentName: string,
    newComponentName: string,
    sourcePackage: string,
    targetPackage: string
): ComponentImportInfo | null {
    const importDeclaration = path.value;

    if (
        importDeclaration &&
        importDeclaration.source &&
        importDeclaration.source.value &&
        typeof importDeclaration.source.value === 'string' &&
        importDeclaration.source.value === sourcePackage
    ) {
        let componentInfo: ComponentImportInfo | null = null;
        const otherSpecifiers: typeof importDeclaration.specifiers = [];

        importDeclaration.specifiers?.forEach((specifier) => {
            if (
                specifier.type === 'ImportSpecifier' &&
                specifier.imported.name === oldComponentName
            ) {
                componentInfo = {
                    localName: (specifier.local?.name as string) || oldComponentName,
                    importedName: oldComponentName,
                    found: true,
                };
            } else {
                otherSpecifiers.push(specifier);
            }
        });

        if (componentInfo) {
            if (otherSpecifiers.length === 0) {
                importDeclaration.source.value = targetPackage;
                importDeclaration.specifiers = [j.importSpecifier(j.identifier(newComponentName))];
            } else {
                importDeclaration.specifiers = otherSpecifiers;

                const allTargetImports = root.find(j.ImportDeclaration, {
                    source: { value: targetPackage },
                });

                if (allTargetImports.length > 0) {
                    const firstImport = allTargetImports.at(0).get().value;
                    const hasComponentImport = firstImport.specifiers?.some(
                        (spec: ImportSpecifier) =>
                            spec.type === 'ImportSpecifier' &&
                            spec.imported.name === newComponentName
                    );

                    if (!hasComponentImport) {
                        firstImport.specifiers?.push(
                            j.importSpecifier(j.identifier(newComponentName))
                        );
                    }
                } else {
                    const componentImport = j.importDeclaration(
                        [j.importSpecifier(j.identifier(newComponentName))],
                        j.literal(targetPackage)
                    );

                    path.insertAfter(componentImport);
                }
            }

            return componentInfo;
        }
    }

    return null;
}

/**
 * Merge multiple imports from the same package into one
 */
export function mergeImports(root: Collection, j: API['jscodeshift'], packageName: string): void {
    const imports = root.find(j.ImportDeclaration, {
        source: { value: packageName },
    });

    if (imports.length > 1) {
        const allSpecifiers: ImportSpecifier[] = [];
        imports.forEach((path: ASTPath<ImportDeclaration>) => {
            path.value.specifiers?.forEach((spec) => {
                if (spec.type === 'ImportSpecifier') {
                    const exists = allSpecifiers.some(
                        (s) => s.imported.name === spec.imported.name
                    );
                    if (!exists) {
                        allSpecifiers.push(spec);
                    }
                }
            });
        });

        const firstImport = imports.at(0).get();
        firstImport.value.specifiers = allSpecifiers;

        imports.forEach((path, idx) => {
            if (idx > 0) {
                j(path).remove();
            }
        });
    }
}

/**
 * Case 1: Simple package migration
 * Replaces the entire import statement from source to target package
 * Example: import { Button } from 'A' -> import { Button } from 'B'
 */
function handleSimplePackageMigration(
    path: ASTPath<ImportDeclaration>,
    sourcePackage: string,
    targetPackage: string
): boolean {
    const importDeclaration = path.value;
    if (importDeclaration.source.value === sourcePackage) {
        importDeclaration.source.value = targetPackage;
        return true;
    }
    return false;
}

/**
 * Case 2: Progressive/individual component migration
 * Migrates only the target component from source package, keeping others
 * Example: import { Button, Modal } from 'A' -> import { Modal } from 'A' (Button removed)
 */
function handleComponentExtraction(
    path: ASTPath<ImportDeclaration>,
    componentName: string,
    sourcePackage: string,
    targetPackage: string
): ComponentImportInfo | null {
    const importDeclaration = path.value;
    let componentInfo: ComponentImportInfo | null = null;

    if (importDeclaration.source.value === sourcePackage) {
        const otherSpecifiers: typeof importDeclaration.specifiers = [];

        importDeclaration.specifiers?.forEach((specifier) => {
            if (specifier.type === 'ImportSpecifier' && specifier.imported.name === componentName) {
                componentInfo = {
                    localName: (specifier.local?.name as string) || componentName,
                    importedName: componentName,
                    found: true,
                };
            } else {
                otherSpecifiers.push(specifier);
            }
        });

        if (componentInfo) {
            if (otherSpecifiers.length === 0) {
                // If this was the only specifier, change the package
                importDeclaration.source.value = targetPackage;
            } else {
                // Keep other specifiers in source package
                importDeclaration.specifiers = otherSpecifiers;
            }
        }
    }

    return componentInfo;
}

/**
 * Case 3: Merge with existing target package import
 * Adds the migrated component to existing target package import
 * Example: import { Checkbox } from 'B' -> import { Checkbox, Button } from 'B'
 */
function handleMergeWithExistingImport(
    root: Collection,
    j: API['jscodeshift'],
    path: ASTPath<ImportDeclaration>,
    componentName: string,
    targetPackage: string
): void {
    const allTargetImports = root.find(j.ImportDeclaration, {
        source: { value: targetPackage },
    });

    if (allTargetImports.length > 0) {
        const firstImport = allTargetImports.at(0).get().value;
        const hasComponentImport = firstImport.specifiers?.some(
            (spec: ImportSpecifier) =>
                spec.type === 'ImportSpecifier' && spec.imported.name === componentName
        );

        if (!hasComponentImport) {
            firstImport.specifiers?.push(j.importSpecifier(j.identifier(componentName)));
        }
    } else {
        // Create new import if target package doesn't exist
        const componentImport = j.importDeclaration(
            [j.importSpecifier(j.identifier(componentName))],
            j.literal(targetPackage)
        );
        path.insertAfter(componentImport);
    }
}

/**
 * Case 4: Rename migration
 * Migrates a component with a name change
 * Example: import { OldButton } from 'A' -> import { NewButton } from 'B'
 */
function handleRenameMigration(
    root: Collection,
    j: API['jscodeshift'],
    path: ASTPath<ImportDeclaration>,
    oldComponentName: string,
    newComponentName: string,
    sourcePackage: string,
    targetPackage: string
): ComponentImportInfo | null {
    const importDeclaration = path.value;
    let componentInfo: ComponentImportInfo | null = null;

    if (importDeclaration.source.value === sourcePackage) {
        const otherSpecifiers: typeof importDeclaration.specifiers = [];

        importDeclaration.specifiers?.forEach((specifier) => {
            if (
                specifier.type === 'ImportSpecifier' &&
                specifier.imported.name === oldComponentName
            ) {
                componentInfo = {
                    localName: (specifier.local?.name as string) || oldComponentName,
                    importedName: oldComponentName,
                    found: true,
                };
            } else {
                otherSpecifiers.push(specifier);
            }
        });

        if (componentInfo) {
            if (otherSpecifiers.length === 0) {
                // If this was the only specifier, replace the entire import
                importDeclaration.source.value = targetPackage;
                importDeclaration.specifiers = [j.importSpecifier(j.identifier(newComponentName))];
            } else {
                // Keep other specifiers, remove the old component
                importDeclaration.specifiers = otherSpecifiers;

                // Add new component to target package
                const allTargetImports = root.find(j.ImportDeclaration, {
                    source: { value: targetPackage },
                });

                if (allTargetImports.length > 0) {
                    const firstImport = allTargetImports.at(0).get().value;
                    const hasComponentImport = firstImport.specifiers?.some(
                        (spec: ImportSpecifier) =>
                            spec.type === 'ImportSpecifier' &&
                            spec.imported.name === newComponentName
                    );

                    if (!hasComponentImport) {
                        firstImport.specifiers?.push(
                            j.importSpecifier(j.identifier(newComponentName))
                        );
                    }
                } else {
                    const componentImport = j.importDeclaration(
                        [j.importSpecifier(j.identifier(newComponentName))],
                        j.literal(targetPackage)
                    );
                    path.insertAfter(componentImport);
                }
            }
        }
    }

    return componentInfo;
}

/**
 * Main migration function that determines which strategy to use
 * based on the migration parameters
 */
export function migrateImportDeclaration({
    root,
    j,
    path,
    oldComponentName,
    newComponentName,
    sourcePackage,
    targetPackage,
}: {
    root: Collection;
    j: API['jscodeshift'];
    path: ASTPath<ImportDeclaration>;
    oldComponentName: string;
    newComponentName: string;
    sourcePackage: string;
    targetPackage: string;
}): ComponentImportInfo | null {
    const importDeclaration = path.value;

    // Case 4: Rename migration (component name changes)
    if (oldComponentName !== newComponentName) {
        return handleRenameMigration(
            root,
            j,
            path,
            oldComponentName,
            newComponentName,
            sourcePackage,
            targetPackage
        );
    }

    // Cases 1-3: Migration without rename
    // First, extract the component from source package (handles Case 2)
    const componentInfo = handleComponentExtraction(
        path,
        oldComponentName,
        sourcePackage,
        targetPackage
    );

    if (componentInfo) {
        // Check if we need to handle Case 1 (simple migration) or Case 3 (merge)
        const remainingSpecifiers = importDeclaration.specifiers?.length || 0;

        if (remainingSpecifiers === 0 || importDeclaration.source.value === targetPackage) {
            // Case 1: Simple migration (entire import was changed)
            handleSimplePackageMigration(path, sourcePackage, targetPackage);
            return componentInfo;
        } else {
            // Case 3: Merge with existing target package import
            handleMergeWithExistingImport(root, j, path, newComponentName, targetPackage);
            return componentInfo;
        }
    }

    return null;
}
