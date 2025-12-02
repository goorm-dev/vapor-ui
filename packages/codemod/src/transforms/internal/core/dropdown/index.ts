import type {
    API,
    FileInfo,
    ImportSpecifier,
    JSXAttribute,
    JSXElement,
    Transform,
} from 'jscodeshift';

import {
    cleanUpSourcePackage,
    collectImportSpecifiersToMove,
    createNewImportDeclaration,
    mergeIntoExistingImport,
} from '~/utils/import-transform';
import {
    transformAsChildToRender,
    transformToMemberExpression,
    updateMemberExpressionObject,
} from '~/utils/jsx-transform';

const SOURCE_PACKAGE = '@goorm-dev/vapor-core';
const TARGET_PACKAGE = '@vapor-ui/core';
const OLD_COMPONENT_NAME = 'Dropdown';
const NEW_COMPONENT_NAME = 'Menu';

const transform: Transform = (fileInfo: FileInfo, api: API) => {
    const j = api.jscodeshift;
    const root = j(fileInfo.source);

    const allSpecifiers: ImportSpecifier[] = collectImportSpecifiersToMove(j, root, SOURCE_PACKAGE);
    const specifiersToMove = allSpecifiers.filter(
        (spec) => spec.imported.name === OLD_COMPONENT_NAME,
    );

    if (specifiersToMove.length === 0) {
        return root.toSource();
    }

    const oldDropdownImportName =
        specifiersToMove.find((spec) => spec.imported.name === OLD_COMPONENT_NAME)?.local?.name ||
        OLD_COMPONENT_NAME;

    const transformedSpecifiers: ImportSpecifier[] = [
        j.importSpecifier(j.identifier(NEW_COMPONENT_NAME)),
    ];

    const menuImportName = NEW_COMPONENT_NAME;

    const rootPropsToMove = new Map<
        JSXElement,
        {
            side?: string | null;
            align?: string | null;
            sideAttr?: JSXAttribute;
            alignAttr?: JSXAttribute;
        }
    >();

    root.find(j.JSXElement).forEach((path) => {
        const element: JSXElement = path.value;

        if (
            element.openingElement.name.type === 'JSXIdentifier' &&
            element.openingElement.name.name === oldDropdownImportName
        ) {
            const attributes = element.openingElement.attributes || [];
            let side: string | null = null;
            let align: string | null = null;
            let sideAttr: JSXAttribute | undefined;
            let alignAttr: JSXAttribute | undefined;

            attributes.forEach((attr) => {
                if (attr.type === 'JSXAttribute') {
                    if (attr.name.name === 'side' && attr.value) {
                        sideAttr = attr;
                        if (attr.value.type === 'StringLiteral') {
                            side = attr.value.value;
                        }
                    } else if (attr.name.name === 'align' && attr.value) {
                        alignAttr = attr;
                        if (attr.value.type === 'StringLiteral') {
                            align = attr.value.value;
                        }
                    }
                }
            });

            if (side || align) {
                rootPropsToMove.set(element, { side, align, sideAttr, alignAttr });
            }

            element.openingElement.attributes = attributes.filter((attr) => {
                if (attr.type === 'JSXAttribute') {
                    return attr.name.name !== 'side' && attr.name.name !== 'align';
                }
                return true;
            });

            transformToMemberExpression(j, element, menuImportName, 'Root');
            transformAsChildToRender(j, element);
        }
    });

    root.find(j.JSXElement).forEach((path) => {
        const element = path.value;

        if (
            element.openingElement.name.type === 'JSXMemberExpression' &&
            element.openingElement.name.object.type === 'JSXIdentifier' &&
            element.openingElement.name.object.name === oldDropdownImportName
        ) {
            const propertyName =
                element.openingElement.name.property.type === 'JSXIdentifier'
                    ? element.openingElement.name.property.name
                    : null;

            if (propertyName === 'Portal') {
                const parentPath = path.parent;
                if (parentPath && parentPath.value && parentPath.value.type === 'JSXElement') {
                    const children = element.children || [];
                    const contentChild = children.find((child) => {
                        if (child.type === 'JSXElement') {
                            const childName = child.openingElement.name;
                            if (
                                childName.type === 'JSXMemberExpression' &&
                                childName.object.type === 'JSXIdentifier' &&
                                childName.object.name === oldDropdownImportName &&
                                childName.property.type === 'JSXIdentifier' &&
                                (childName.property.name === 'Content' ||
                                    childName.property.name === 'SubContent')
                            ) {
                                return true;
                            }
                        }
                        return false;
                    });

                    if (contentChild && contentChild.type === 'JSXElement') {
                        const portalAttributes = element.openingElement.attributes || [];
                        let hasForceMount = false;

                        portalAttributes.forEach((attr) => {
                            if (attr.type === 'JSXAttribute' && attr.name.name === 'forceMount') {
                                hasForceMount = true;
                            }
                        });

                        const contentAttributes = contentChild.openingElement.attributes || [];
                        let maxHeightValue: string | null = null;

                        const filteredContentAttrs = contentAttributes.filter((attr) => {
                            if (attr.type === 'JSXAttribute' && attr.name.name === 'maxHeight') {
                                if (attr.value && attr.value.type === 'StringLiteral') {
                                    maxHeightValue = attr.value.value;
                                }
                                return false;
                            }
                            return true;
                        });

                        if (maxHeightValue) {
                            const existingStyleAttr = filteredContentAttrs.find(
                                (attr) =>
                                    attr.type === 'JSXAttribute' && attr.name.name === 'style',
                            );

                            if (existingStyleAttr && existingStyleAttr.type === 'JSXAttribute') {
                                if (
                                    existingStyleAttr.value &&
                                    existingStyleAttr.value.type === 'JSXExpressionContainer' &&
                                    existingStyleAttr.value.expression.type === 'ObjectExpression'
                                ) {
                                    existingStyleAttr.value.expression.properties.push(
                                        j.objectProperty(
                                            j.identifier('maxHeight'),
                                            j.stringLiteral(maxHeightValue),
                                        ),
                                    );
                                }
                            } else {
                                filteredContentAttrs.push(
                                    j.jsxAttribute(
                                        j.jsxIdentifier('style'),
                                        j.jsxExpressionContainer(
                                            j.objectExpression([
                                                j.objectProperty(
                                                    j.identifier('maxHeight'),
                                                    j.stringLiteral(maxHeightValue),
                                                ),
                                            ]),
                                        ),
                                    ),
                                );
                            }
                        }

                        let parentRoot: JSXElement | null = null;
                        let currentPath = path.parent;
                        while (currentPath && currentPath.value) {
                            if (
                                currentPath.value.type === 'JSXElement' &&
                                currentPath.value.openingElement.name.type ===
                                    'JSXMemberExpression' &&
                                currentPath.value.openingElement.name.object.type ===
                                    'JSXIdentifier' &&
                                currentPath.value.openingElement.name.object.name ===
                                    menuImportName &&
                                currentPath.value.openingElement.name.property.type ===
                                    'JSXIdentifier' &&
                                currentPath.value.openingElement.name.property.name === 'Root'
                            ) {
                                parentRoot = currentPath.value;
                                break;
                            }
                            currentPath = currentPath.parent;
                        }

                        const rootProps = parentRoot ? rootPropsToMove.get(parentRoot) : null;
                        const popupAttrs = [...filteredContentAttrs];

                        if (hasForceMount) {
                            popupAttrs.push(
                                j.jsxAttribute(
                                    j.jsxIdentifier('portalElement'),
                                    j.jsxExpressionContainer(
                                        j.jsxElement(
                                            j.jsxOpeningElement(
                                                j.jsxMemberExpression(
                                                    j.jsxIdentifier(menuImportName),
                                                    j.jsxIdentifier('PortalPrimitive'),
                                                ),
                                                [j.jsxAttribute(j.jsxIdentifier('keepMounted'))],
                                                true,
                                            ),
                                        ),
                                    ),
                                ),
                            );
                        }

                        if (rootProps && (rootProps.side || rootProps.align)) {
                            const positionerProps: JSXAttribute[] = [];

                            if (rootProps.side && rootProps.sideAttr) {
                                positionerProps.push(
                                    j.jsxAttribute(
                                        j.jsxIdentifier('side'),
                                        rootProps.sideAttr.value || j.stringLiteral('bottom'),
                                    ),
                                );
                            }

                            if (rootProps.align && rootProps.alignAttr) {
                                positionerProps.push(
                                    j.jsxAttribute(
                                        j.jsxIdentifier('align'),
                                        rootProps.alignAttr.value || j.stringLiteral('start'),
                                    ),
                                );
                            }

                            popupAttrs.push(
                                j.jsxAttribute(
                                    j.jsxIdentifier('positionerElement'),
                                    j.jsxExpressionContainer(
                                        j.jsxElement(
                                            j.jsxOpeningElement(
                                                j.jsxMemberExpression(
                                                    j.jsxIdentifier(menuImportName),
                                                    j.jsxIdentifier('PositionerPrimitive'),
                                                ),
                                                positionerProps,
                                                true,
                                            ),
                                        ),
                                    ),
                                ),
                            );
                        }

                        const isSubmenu =
                            contentChild.openingElement.name.type === 'JSXMemberExpression' &&
                            contentChild.openingElement.name.property.type === 'JSXIdentifier' &&
                            contentChild.openingElement.name.property.name === 'SubContent';

                        j(path).replaceWith(
                            j.jsxElement(
                                j.jsxOpeningElement(
                                    j.jsxMemberExpression(
                                        j.jsxIdentifier(menuImportName),
                                        j.jsxIdentifier(isSubmenu ? 'SubmenuPopup' : 'Popup'),
                                    ),
                                    popupAttrs,
                                ),
                                j.jsxClosingElement(
                                    j.jsxMemberExpression(
                                        j.jsxIdentifier(menuImportName),
                                        j.jsxIdentifier(isSubmenu ? 'SubmenuPopup' : 'Popup'),
                                    ),
                                ),
                                contentChild.children,
                            ),
                        );
                        return;
                    }
                }
            }

            let newPropertyName = propertyName;
            switch (propertyName) {
                case 'Contents':
                case 'CombinedContent':
                    newPropertyName = 'Popup';
                    break;
                case 'Divider':
                    newPropertyName = 'Separator';
                    break;
                case 'Sub':
                    newPropertyName = 'SubmenuRoot';
                    break;
                case 'SubTrigger':
                    newPropertyName = 'SubmenuTriggerItem';
                    break;
                case 'SubContents':
                case 'SubCombinedContent':
                    newPropertyName = 'SubmenuPopup';
                    break;
            }

            updateMemberExpressionObject(element, menuImportName);

            if (newPropertyName !== propertyName && newPropertyName) {
                element.openingElement.name.property = j.jsxIdentifier(newPropertyName);
                if (
                    element.closingElement &&
                    element.closingElement.name.type === 'JSXMemberExpression'
                ) {
                    element.closingElement.name.property = j.jsxIdentifier(newPropertyName);
                }
            }

            transformAsChildToRender(j, element);
        }
    });

    const targetImport = root.find(j.ImportDeclaration, {
        source: { value: TARGET_PACKAGE },
    });

    if (targetImport.length > 0) {
        mergeIntoExistingImport(targetImport, transformedSpecifiers);
    } else {
        createNewImportDeclaration(j, root, TARGET_PACKAGE, transformedSpecifiers);
    }

    cleanUpSourcePackage(j, root, SOURCE_PACKAGE, specifiersToMove);

    return root.toSource();
};

export default transform;
export const parser = 'tsx';
