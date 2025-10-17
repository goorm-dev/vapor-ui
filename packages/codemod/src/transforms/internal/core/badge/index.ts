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
            let hasBadge = false;
            const otherSpecifiers: typeof importDeclaration.specifiers = [];

            importDeclaration.specifiers?.forEach((specifier) => {
                if (specifier.type === 'ImportSpecifier' && specifier.imported.name === 'Badge') {
                    hasBadge = true;
                } else {
                    otherSpecifiers.push(specifier);
                }
            });

            if (hasBadge) {
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
                        const hasBadgeImport = existingImport.specifiers?.some(
                            (spec: ImportSpecifier) =>
                                spec.type === 'ImportSpecifier' && spec.imported.name === 'Badge'
                        );

                        if (!hasBadgeImport) {
                            existingImport.specifiers?.push(
                                j.importSpecifier(j.identifier('Badge'))
                            );
                        }
                    } else {
                        const badgeImport = j.importDeclaration(
                            [j.importSpecifier(j.identifier('Badge'))],
                            j.literal('@vapor-ui/core')
                        );

                        path.insertAfter(badgeImport);
                    }
                }
            }
        }
    });

    root.find(j.JSXElement).forEach((path) => {
        const element = path.value;

        if (
            element.openingElement.name.type === 'JSXIdentifier' &&
            element.openingElement.name.name === 'Badge'
        ) {
            element.openingElement.attributes?.forEach((attr, index) => {
                if (attr.type === 'JSXAttribute' && attr.name.name === 'pill') {
                    const pillValue = attr.value;

                    if (
                        pillValue &&
                        pillValue.type === 'JSXExpressionContainer' &&
                        pillValue.expression.type === 'BooleanLiteral'
                    ) {
                        const newShapeValue = pillValue.expression.value ? 'pill' : 'square';

                        const shapeAttr = j.jsxAttribute(
                            j.jsxIdentifier('shape'),
                            j.stringLiteral(newShapeValue)
                        );

                        element.openingElement.attributes![index] = shapeAttr;
                    } else if (!pillValue || (pillValue.type === 'StringLiteral' && pillValue.value === 'true')) {
                        const shapeAttr = j.jsxAttribute(
                            j.jsxIdentifier('shape'),
                            j.stringLiteral('pill')
                        );

                        element.openingElement.attributes![index] = shapeAttr;
                    }
                }
            });
        }
    });

    return root.toSource({});
};

export default transform;
export const parser = 'tsx';
