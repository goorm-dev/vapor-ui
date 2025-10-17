import type { API, FileInfo, ImportSpecifier, Transform } from 'jscodeshift';

const transform: Transform = (fileInfo: FileInfo, api: API) => {
    const j = api.jscodeshift;
    const root = j(fileInfo.source);

    root.find(j.ImportDeclaration).forEach((path) => {
        const importDeclaration = path.value;

        if (
            importDeclaration.source.value &&
            typeof importDeclaration.source.value === 'string' &&
            importDeclaration.source.value === '@goorm-dev/vapor-core'
        ) {
            let hasButton = false;
            const otherSpecifiers: typeof importDeclaration.specifiers = [];

            importDeclaration.specifiers?.forEach((specifier) => {
                if (specifier.type === 'ImportSpecifier' && specifier.imported.name === 'Button') {
                    hasButton = true;
                } else {
                    otherSpecifiers.push(specifier);
                }
            });

            if (hasButton) {
                if (otherSpecifiers.length === 0) {
                    importDeclaration.source.value = '@vapor-ui/core';
                } else {
                    importDeclaration.specifiers = otherSpecifiers;

                    const existingVaporImport = root
                        .find(j.ImportDeclaration, {
                            source: { value: '@vapor-ui/core' },
                        })
                        .at(0);

                    if (existingVaporImport.length > 0) {
                        const existingImport = existingVaporImport.get().value;
                        const hasButtonImport = existingImport.specifiers?.some(
                            (spec: ImportSpecifier) =>
                                spec.type === 'ImportSpecifier' && spec.imported.name === 'Button'
                        );

                        if (!hasButtonImport) {
                            existingImport.specifiers?.push(
                                j.importSpecifier(j.identifier('Button'))
                            );
                        }
                    } else {
                        const buttonImport = j.importDeclaration(
                            [j.importSpecifier(j.identifier('Button'))],
                            j.literal('@vapor-ui/core')
                        );

                        path.insertAfter(buttonImport);
                    }
                }
            }
        }
    });

    root.find(j.JSXElement).forEach((path) => {
        const element = path.value;

        if (
            element.openingElement.name.type === 'JSXIdentifier' &&
            element.openingElement.name.name === 'Button'
        ) {
            element.openingElement.attributes?.forEach((attr) => {
                if (attr.type === 'JSXAttribute' && attr.name.name === 'shape') {
                    attr.name.name = 'variant';

                    if (
                        attr.value &&
                        attr.value.type === 'StringLiteral' &&
                        attr.value.value === 'invisible'
                    ) {
                        attr.value.value = 'ghost';
                    }
                }
            });
        }
    });

    return root.toSource({});
};

export default transform;
export const parser = 'tsx';
