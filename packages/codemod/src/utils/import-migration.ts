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

                const existingVaporImport = root
                    .find(j.ImportDeclaration, {
                        source: { value: targetPackage },
                    })
                    .at(0);

                if (existingVaporImport.length > 0) {
                    const existingImport = existingVaporImport.get().value;
                    const hasComponentImport = existingImport.specifiers?.some(
                        (spec: ImportSpecifier) =>
                            spec.type === 'ImportSpecifier' && spec.imported.name === componentName
                    );

                    if (!hasComponentImport) {
                        existingImport.specifiers?.push(
                            j.importSpecifier(j.identifier(componentName))
                        );
                    }
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
