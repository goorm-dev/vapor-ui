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
                importDeclaration.source.value = targetPackage;
            } else {
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
                            spec.type === 'ImportSpecifier' && spec.imported.name === newComponentName
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
