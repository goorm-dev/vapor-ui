import type {
    API,
    FileInfo,
    JSXAttribute,
    JSXElement,
    StringLiteral,
    Transform,
} from 'jscodeshift';

import {
    getFinalImportName,
    hasComponentInPackage,
    transformImportDeclaration,
} from '~/utils/import-transform';

const SOURCE_PACKAGE = '@goorm-dev/vapor-core';
const TARGET_PACKAGE = '@vapor-ui/core';
const OLD_COMPONENT_NAME = 'Breadcrumb';
const NEW_COMPONENT_NAME = 'Breadcrumb';

const transform: Transform = (fileInfo: FileInfo, api: API) => {
    const j = api.jscodeshift;
    const root = j(fileInfo.source);

    if (!hasComponentInPackage(root, j, OLD_COMPONENT_NAME, SOURCE_PACKAGE)) {
        return fileInfo.source;
    }

    //  1. Import migration:
    transformImportDeclaration({
        root,
        j,
        oldComponentName: OLD_COMPONENT_NAME,
        newComponentName: NEW_COMPONENT_NAME,
        sourcePackage: SOURCE_PACKAGE,
        targetPackage: TARGET_PACKAGE,
    });

    const breadcrumbImportName = getFinalImportName(root, j, OLD_COMPONENT_NAME, SOURCE_PACKAGE);

    root.find(j.JSXElement).forEach((path) => {
        const element = path.value;

        if (
            element.openingElement.name.type === 'JSXIdentifier' &&
            element.openingElement.name.name === breadcrumbImportName
        ) {
            element.openingElement.name = j.jsxMemberExpression(
                j.jsxIdentifier(breadcrumbImportName),
                j.jsxIdentifier('Root'),
            );

            if (element.closingElement) {
                element.closingElement.name = j.jsxMemberExpression(
                    j.jsxIdentifier(breadcrumbImportName),
                    j.jsxIdentifier('Root'),
                );
            }

            element.openingElement.attributes?.forEach((attr) => {
                if (attr.type === 'JSXAttribute' && attr.name.name === 'size') {
                    if (
                        attr.value &&
                        attr.value.type === 'StringLiteral' &&
                        attr.value.value === 'xs'
                    ) {
                        attr.value.value = 'sm';
                    }
                }
            });

            const itemElements: JSXElement[] = [];
            let hasMapExpression = false;

            element.children?.forEach((child) => {
                if (
                    child.type === 'JSXExpressionContainer' &&
                    child.expression.type === 'CallExpression'
                ) {
                    hasMapExpression = true;
                } else if (
                    child.type === 'JSXElement' &&
                    child.openingElement.name.type === 'JSXMemberExpression' &&
                    child.openingElement.name.object.type === 'JSXIdentifier' &&
                    child.openingElement.name.object.name === breadcrumbImportName &&
                    child.openingElement.name.property.name === 'Item'
                ) {
                    itemElements.push(child);
                }
            });

            if (hasMapExpression) {
                const listElement = j.jsxElement(
                    j.jsxOpeningElement(
                        j.jsxMemberExpression(
                            j.jsxIdentifier(breadcrumbImportName),
                            j.jsxIdentifier('List'),
                        ),
                        [],
                    ),
                    j.jsxClosingElement(
                        j.jsxMemberExpression(
                            j.jsxIdentifier('Breadcrumb'),
                            j.jsxIdentifier('List'),
                        ),
                    ),
                    [
                        j.jsxText('\n            '),
                        ...(element.children || []),
                        j.jsxText('\n        '),
                    ],
                );
                element.children = [j.jsxText('\n        '), listElement, j.jsxText('\n    ')];
                return;
            }

            const newChildren: (JSXElement | ReturnType<typeof j.jsxText>)[] = [];
            itemElements.forEach((item, index) => {
                newChildren.push(j.jsxText('\n    '));
                let href: string | undefined;
                let active = false;
                const otherAttrs: JSXAttribute[] = [];

                item.openingElement.attributes?.forEach((attr) => {
                    if (attr.type === 'JSXAttribute') {
                        if (attr.name.name === 'href') {
                            href = (attr.value as StringLiteral).value;
                        } else if (attr.name.name === 'active') {
                            active = true;
                        } else {
                            otherAttrs.push(attr);
                        }
                    }
                });

                const linkElement = j.jsxElement(
                    j.jsxOpeningElement(
                        j.jsxMemberExpression(
                            j.jsxIdentifier(breadcrumbImportName),
                            j.jsxIdentifier('Link'),
                        ),
                        [
                            ...(href
                                ? [
                                      j.jsxAttribute(
                                          j.jsxIdentifier('href'),
                                          typeof href === 'string' ? j.stringLiteral(href) : href,
                                      ),
                                  ]
                                : []),
                            ...(active ? [j.jsxAttribute(j.jsxIdentifier('current'))] : []),
                        ],
                    ),
                    j.jsxClosingElement(
                        j.jsxMemberExpression(
                            j.jsxIdentifier(breadcrumbImportName),
                            j.jsxIdentifier('Link'),
                        ),
                    ),
                    item.children,
                );

                const wrappedItem = j.jsxElement(
                    j.jsxOpeningElement(
                        j.jsxMemberExpression(
                            j.jsxIdentifier(breadcrumbImportName),
                            j.jsxIdentifier('Item'),
                        ),
                        otherAttrs,
                    ),
                    j.jsxClosingElement(
                        j.jsxMemberExpression(
                            j.jsxIdentifier(breadcrumbImportName),
                            j.jsxIdentifier('Item'),
                        ),
                    ),
                    [j.jsxText('\n      '), linkElement, j.jsxText('\n    ')],
                );

                newChildren.push(wrappedItem);

                if (index < itemElements.length - 1) {
                    newChildren.push(j.jsxText('\n    '));
                    newChildren.push(
                        j.jsxElement(
                            j.jsxOpeningElement(
                                j.jsxMemberExpression(
                                    j.jsxIdentifier(breadcrumbImportName),
                                    j.jsxIdentifier('Separator'),
                                ),
                                [],
                                true,
                            ),
                        ),
                    );
                }
            });

            newChildren.push(j.jsxText('\n  '));

            const listElement = j.jsxElement(
                j.jsxOpeningElement(
                    j.jsxMemberExpression(
                        j.jsxIdentifier(breadcrumbImportName),
                        j.jsxIdentifier('List'),
                    ),
                    [],
                ),
                j.jsxClosingElement(
                    j.jsxMemberExpression(
                        j.jsxIdentifier(breadcrumbImportName),
                        j.jsxIdentifier('List'),
                    ),
                ),
                newChildren,
            );

            element.children = [j.jsxText('\n  '), listElement, j.jsxText('\n')];
        }

        if (
            element.openingElement.name.type === 'JSXMemberExpression' &&
            element.openingElement.name.object.type === 'JSXIdentifier' &&
            element.openingElement.name.object.name === breadcrumbImportName
        ) {
            const propertyName = element.openingElement.name.property.name;

            if (propertyName === 'Item') {
                element.openingElement.attributes?.forEach((attr) => {
                    if (attr.type === 'JSXAttribute' && attr.name.name === 'active') {
                        attr.name.name = 'current';
                    }
                });
            }
        }
    });

    const printOptions = {
        quote: 'auto' as const,
        trailingComma: true,
        tabWidth: 4,
        reuseWhitespace: true,
    };

    return root.toSource(printOptions);
};

export default transform;
export const parser = 'tsx';
