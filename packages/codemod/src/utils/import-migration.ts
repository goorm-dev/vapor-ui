import type { API, ASTPath, Collection, ImportDeclaration, ImportSpecifier } from 'jscodeshift';

export function migrateImportSpecifier(
    root: Collection,
    j: API['jscodeshift'],
    path: ASTPath<ImportDeclaration>,
    componentName: string,
    sourcePackage: string,
    targetPackage: string
) {
    const importDeclaration = path.value;

    if (
        importDeclaration.source.value &&
        typeof importDeclaration.source.value === 'string' &&
        importDeclaration.source.value === sourcePackage
    ) {
        let hasComponent = false;
        const otherSpecifiers: typeof importDeclaration.specifiers = [];

        importDeclaration.specifiers?.forEach((specifier) => {
            if (specifier.type === 'ImportSpecifier' && specifier.imported.name === componentName) {
                hasComponent = true;
            } else {
                otherSpecifiers.push(specifier);
            }
        });

        if (hasComponent) {
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

                    allTargetImports.forEach((p, idx) => {
                        if (idx > 0) {
                            j(p).remove();
                        }
                    });
                } else {
                    const componentImport = j.importDeclaration(
                        [j.importSpecifier(j.identifier(componentName))],
                        j.literal(targetPackage)
                    );

                    path.insertAfter(componentImport);
                }
            }
        }
    }
}
