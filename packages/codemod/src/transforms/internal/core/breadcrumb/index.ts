import type { API, FileInfo, JSXAttribute, JSXElement, Transform } from 'jscodeshift';

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

    const transformBreadcrumbItem = (item: JSXElement): JSXElement => {
        let hrefAttr: JSXAttribute | undefined;
        let activeAttr: JSXAttribute | undefined;
        const otherAttrs: JSXAttribute[] = [];

        item.openingElement.attributes?.forEach((attr) => {
            if (attr.type === 'JSXAttribute') {
                if (attr.name.name === 'href') {
                    hrefAttr = attr;
                } else if (attr.name.name === 'active') {
                    if (
                        attr.value?.type === 'JSXExpressionContainer' &&
                        attr.value.expression.type === 'BooleanLiteral' &&
                        attr.value.expression.value === false
                    ) {
                        return;
                    }
                    activeAttr = attr;
                } else {
                    otherAttrs.push(attr);
                }
            }
        });

        if (!hrefAttr && !activeAttr) {
            return item;
        }

        const linkAttrs: JSXAttribute[] = [];
        if (hrefAttr) {
            linkAttrs.push(j.jsxAttribute(j.jsxIdentifier('href'), hrefAttr.value));
        }
        if (activeAttr) {
            linkAttrs.push(j.jsxAttribute(j.jsxIdentifier('current'), activeAttr.value));
        }

        const linkElement = j.jsxElement(
            j.jsxOpeningElement(
                j.jsxMemberExpression(
                    j.jsxIdentifier(breadcrumbImportName),
                    j.jsxIdentifier('Link'),
                ),
                linkAttrs,
            ),
            j.jsxClosingElement(
                j.jsxMemberExpression(
                    j.jsxIdentifier(breadcrumbImportName),
                    j.jsxIdentifier('Link'),
                ),
            ),
            item.children,
        );

        return j.jsxElement(
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
    };

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
                const transformedChildren = (element.children || []).map((child) => {
                    if (
                        child.type === 'JSXExpressionContainer' &&
                        child.expression.type === 'CallExpression' &&
                        child.expression.callee.type === 'MemberExpression' &&
                        child.expression.callee.property.type === 'Identifier' &&
                        child.expression.callee.property.name === 'map'
                    ) {
                        const mapCallback = child.expression.arguments[0];
                        if (
                            mapCallback &&
                            (mapCallback.type === 'ArrowFunctionExpression' ||
                                mapCallback.type === 'FunctionExpression')
                        ) {
                            const callbackBody = mapCallback.body;
                            const callbackParams = mapCallback.params;
                            const indexParam = callbackParams[1];

                            if (callbackBody.type === 'JSXElement') {
                                if (
                                    callbackBody.openingElement.name.type ===
                                        'JSXMemberExpression' &&
                                    callbackBody.openingElement.name.object.type ===
                                        'JSXIdentifier' &&
                                    callbackBody.openingElement.name.object.name ===
                                        breadcrumbImportName &&
                                    callbackBody.openingElement.name.property.name === 'Item'
                                ) {
                                    const itemCopy = j.jsxElement(
                                        callbackBody.openingElement,
                                        callbackBody.closingElement,
                                        callbackBody.children,
                                    );
                                    const transformedItem = transformBreadcrumbItem(itemCopy);

                                    const separatorElement = j.jsxElement(
                                        j.jsxOpeningElement(
                                            j.jsxMemberExpression(
                                                j.jsxIdentifier(breadcrumbImportName),
                                                j.jsxIdentifier('Separator'),
                                            ),
                                            [],
                                            true,
                                        ),
                                    );

                                    const indexIdentifier =
                                        indexParam && indexParam.type === 'Identifier'
                                            ? j.identifier(indexParam.name)
                                            : j.identifier('index');

                                    const fragment = j.jsxFragment(
                                        j.jsxOpeningFragment(),
                                        j.jsxClosingFragment(),
                                        [
                                            j.jsxText('\n                '),
                                            transformedItem,
                                            j.jsxText('\n                '),
                                            j.jsxExpressionContainer(
                                                j.logicalExpression(
                                                    '&&',
                                                    j.binaryExpression(
                                                        '<',
                                                        indexIdentifier,
                                                        j.binaryExpression(
                                                            '-',
                                                            j.memberExpression(
                                                                child.expression.callee.object,
                                                                j.identifier('length'),
                                                            ),
                                                            j.numericLiteral(1),
                                                        ),
                                                    ),
                                                    separatorElement,
                                                ),
                                            ),
                                            j.jsxText('\n            '),
                                        ],
                                    );

                                    if (!indexParam) {
                                        callbackParams.push(j.identifier('index'));
                                    }

                                    mapCallback.body = fragment;
                                }
                            } else if (callbackBody.type === 'BlockStatement') {
                                j(callbackBody)
                                    .find(j.JSXElement)
                                    .forEach((jsxPath) => {
                                        const jsxElement = jsxPath.value;
                                        if (
                                            jsxElement.openingElement.name.type ===
                                                'JSXMemberExpression' &&
                                            jsxElement.openingElement.name.object.type ===
                                                'JSXIdentifier' &&
                                            jsxElement.openingElement.name.object.name ===
                                                breadcrumbImportName &&
                                            jsxElement.openingElement.name.property.name === 'Item'
                                        ) {
                                            const transformedItem =
                                                transformBreadcrumbItem(jsxElement);
                                            jsxPath.replace(transformedItem);
                                        }
                                    });
                            }
                        }
                    }
                    return child;
                });

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
                    [j.jsxText('\n            '), ...transformedChildren, j.jsxText('\n        ')],
                );
                element.children = [j.jsxText('\n        '), listElement, j.jsxText('\n    ')];
                return;
            }

            const newChildren: (JSXElement | ReturnType<typeof j.jsxText>)[] = [];
            itemElements.forEach((item, index) => {
                newChildren.push(j.jsxText('\n    '));
                const wrappedItem = transformBreadcrumbItem(item);
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

    return root.toSource();
};

export default transform;
export const parser = 'tsx';
