import type { API, FileInfo, Transform } from 'jscodeshift';
import { migrateImportSpecifier } from '~/utils/import-migration';

const transform: Transform = (fileInfo: FileInfo, api: API) => {
    const j = api.jscodeshift;
    const root = j(fileInfo.source);

    root.find(j.ImportDeclaration).forEach((path) => {
        migrateImportSpecifier(root, j, path, 'Text', '@goorm-dev/vapor-core', '@vapor-ui/core');
    });

    root.find(j.JSXElement).forEach((path) => {
        const element = path.value;

        if (
            element.openingElement.name.type === 'JSXIdentifier' &&
            element.openingElement.name.name === 'Text'
        ) {
            const attributesToRemove: number[] = [];
            let hasAsChild = false;

            element.openingElement.attributes?.forEach((attr, index) => {
                if (attr.type === 'JSXAttribute') {
                    if (attr.name.name === 'align') {
                        attributesToRemove.push(index);
                    } else if (attr.name.name === 'color') {
                        attr.name.name = 'foreground';
                    } else if (attr.name.name === 'asChild') {
                        hasAsChild = true;
                        attributesToRemove.push(index);
                    } else if (attr.name.name === 'as') {
                        const asValue = attr.value;
                        if (
                            asValue &&
                            asValue.type === 'StringLiteral' &&
                            typeof asValue.value === 'string'
                        ) {
                            const renderAttr = j.jsxAttribute(
                                j.jsxIdentifier('render'),
                                j.jsxExpressionContainer(
                                    j.jsxElement(
                                        j.jsxOpeningElement(j.jsxIdentifier(asValue.value), [], true)
                                    )
                                )
                            );
                            element.openingElement.attributes![index] = renderAttr;
                        }
                    }
                }
            });

            if (hasAsChild && element.children && element.children.length > 0) {
                const firstChild = element.children.find(
                    (child) => child.type === 'JSXElement' || child.type === 'JSXFragment'
                );

                if (firstChild && firstChild.type === 'JSXElement') {
                    const childElement = firstChild;
                    const childAttributes = childElement.openingElement.attributes || [];

                    element.openingElement.attributes = [
                        ...(element.openingElement.attributes || []),
                        j.jsxAttribute(
                            j.jsxIdentifier('render'),
                            j.jsxExpressionContainer(
                                j.jsxElement(
                                    j.jsxOpeningElement(
                                        childElement.openingElement.name,
                                        childAttributes,
                                        true
                                    )
                                )
                            )
                        ),
                    ];

                    element.children = childElement.children || [];
                }
            }

            attributesToRemove.reverse().forEach((index) => {
                element.openingElement.attributes?.splice(index, 1);
            });
        }
    });

    return root.toSource({});
};

export default transform;
export const parser = 'tsx';
