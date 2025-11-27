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
const COMPONENT_NAME = 'Popover';
const NEW_COMPONENT_NAME = 'Popover';
const OLD_COMPONENT_NAME = 'Popover';

const spacePaddingMap: Record<string, number> = {
    'space-000': 0,
    'space-050': 4,
    'space-075': 6,
    'space-100': 8,
    'space-150': 12,
    'space-175': 14,
    'space-200': 16,
    'space-225': 18,
    'space-250': 20,
    'space-300': 24,
    'space-400': 32,
    'space-500': 40,
    'space-600': 48,
    'space-700': 56,
    'space-800': 64,
    'space-900': 72,
};

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

    const localName = specifiersToMove[0].local?.name || NEW_COMPONENT_NAME;
    const hasAlias = localName !== NEW_COMPONENT_NAME;

    const transformedSpecifiers: ImportSpecifier[] = hasAlias
        ? [j.importSpecifier(j.identifier(NEW_COMPONENT_NAME), j.identifier(localName as string))]
        : [j.importSpecifier(j.identifier(NEW_COMPONENT_NAME))];

    const popoverImportName = localName;

    const rootPropsToMove = new Map<
        JSXElement,
        {
            side?: string | null;
            align?: string | null;
            sideAttr?: JSXAttribute;
            alignAttr?: JSXAttribute;
            disabledAttr?: JSXAttribute;
        }
    >();

    const portalPropsToMove = new Map<
        JSXElement,
        {
            keepMounted?: boolean;
        }
    >();

    root.find(j.JSXElement).forEach((path) => {
        const element: JSXElement = path.value;

        if (
            element.openingElement.name.type === 'JSXIdentifier' &&
            element.openingElement.name.name === COMPONENT_NAME
        ) {
            const attributes = element.openingElement.attributes || [];
            let side: string | null = null;
            let align: string | null = null;
            let sideAttr: JSXAttribute | undefined;
            let alignAttr: JSXAttribute | undefined;
            let disabledAttr: JSXAttribute | undefined;

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
                    } else if (attr.name.name === 'disabled') {
                        disabledAttr = attr;
                    }
                }
            });

            if (side || align || disabledAttr) {
                rootPropsToMove.set(element, { side, align, sideAttr, alignAttr, disabledAttr });
            }

            element.openingElement.attributes = attributes.filter((attr) => {
                if (attr.type === 'JSXAttribute') {
                    return (
                        attr.name.name !== 'side' &&
                        attr.name.name !== 'align' &&
                        attr.name.name !== 'disabled'
                    );
                }
                return true;
            });

            transformToMemberExpression(j, element, popoverImportName as string, 'Root');
            transformAsChildToRender(j, element);
        }
    });

    root.find(j.JSXElement).forEach((path) => {
        const element = path.value;

        if (
            element.openingElement.name.type === 'JSXMemberExpression' &&
            element.openingElement.name.object.type === 'JSXIdentifier' &&
            element.openingElement.name.object.name === COMPONENT_NAME
        ) {
            const propertyName =
                element.openingElement.name.property.type === 'JSXIdentifier'
                    ? element.openingElement.name.property.name
                    : null;

            updateMemberExpressionObject(element, popoverImportName as string);

            if (propertyName === 'Portal') {
                const attributes = element.openingElement.attributes || [];
                let hasForceMount = false;

                attributes.forEach((attr) => {
                    if (attr.type === 'JSXAttribute' && attr.name.name === 'forceMount') {
                        hasForceMount = true;
                    }
                });

                if (hasForceMount) {
                    portalPropsToMove.set(element, { keepMounted: true });
                }

                const contentChild = element.children?.find((child) => {
                    if (child.type === 'JSXElement') {
                        const childName = child.openingElement.name;
                        if (
                            childName.type === 'JSXMemberExpression' &&
                            childName.property.type === 'JSXIdentifier'
                        ) {
                            return (
                                childName.property.name === 'Content' ||
                                childName.property.name === 'CombinedContent' ||
                                childName.property.name === 'Popup'
                            );
                        }
                    }
                    return false;
                }) as JSXElement | undefined;

                if (contentChild && path.parent?.value?.type === 'JSXElement') {
                    const parentElement = path.parent.value as JSXElement;
                    const portalIndex = parentElement.children?.indexOf(element);
                    if (portalIndex !== undefined && portalIndex !== -1 && parentElement.children) {
                        parentElement.children.splice(
                            portalIndex,
                            1,
                            ...element.children!.filter(
                                (child) => child.type !== 'JSXText' || child.value.trim() !== '',
                            ),
                        );
                    }
                }
                return;
            }

            if (propertyName === 'Arrow' || propertyName === 'Anchor') {
                if (propertyName === 'Anchor' && element.children) {
                    if (path.parent && path.parent.value.type === 'JSXElement') {
                        const parentElement = path.parent.value as JSXElement;
                        if (parentElement.children) {
                            const anchorIndex = parentElement.children.indexOf(element);
                            if (anchorIndex !== -1) {
                                parentElement.children.splice(anchorIndex, 1, ...element.children);
                            }
                        }
                    }
                } else {
                    if (path.parent && path.parent.value.type === 'JSXElement') {
                        const parentElement = path.parent.value as JSXElement;
                        if (parentElement.children) {
                            parentElement.children = parentElement.children.filter(
                                (child) => child !== element,
                            );
                        }
                    }
                }
                return;
            }

            let newPropertyName = propertyName;
            if (propertyName === 'CombinedContent' || propertyName === 'Content') {
                newPropertyName = 'Popup';
            }

            if (newPropertyName !== propertyName && newPropertyName) {
                element.openingElement.name.property = j.jsxIdentifier(newPropertyName);
                if (
                    element.closingElement &&
                    element.closingElement.name.type === 'JSXMemberExpression'
                ) {
                    element.closingElement.name.property = j.jsxIdentifier(newPropertyName);
                }
            }

            if (propertyName === 'Trigger') {
                let parentRoot: JSXElement | null = null;
                let currentPath = path.parent;
                while (currentPath && currentPath.value) {
                    if (
                        currentPath.value.type === 'JSXElement' &&
                        currentPath.value.openingElement.name.type === 'JSXMemberExpression' &&
                        currentPath.value.openingElement.name.object.type === 'JSXIdentifier' &&
                        currentPath.value.openingElement.name.object.name === popoverImportName &&
                        currentPath.value.openingElement.name.property.type === 'JSXIdentifier' &&
                        currentPath.value.openingElement.name.property.name === 'Root'
                    ) {
                        parentRoot = currentPath.value;
                        break;
                    }
                    currentPath = currentPath.parent;
                }

                if (parentRoot) {
                    const rootProps = rootPropsToMove.get(parentRoot);
                    if (rootProps && rootProps.disabledAttr) {
                        element.openingElement.attributes = element.openingElement.attributes || [];
                        element.openingElement.attributes.push(rootProps.disabledAttr);
                    }
                }
            }

            if (
                newPropertyName === 'Popup' ||
                propertyName === 'Content' ||
                propertyName === 'CombinedContent'
            ) {
                const attributes = element.openingElement.attributes || [];

                let parentRoot: JSXElement | null = null;
                let parentPortal: JSXElement | null = null;
                let currentPath = path.parent;
                while (currentPath && currentPath.value) {
                    if (currentPath.value.type === 'JSXElement') {
                        const elemName = currentPath.value.openingElement.name;
                        if (
                            elemName.type === 'JSXMemberExpression' &&
                            elemName.object.type === 'JSXIdentifier' &&
                            elemName.object.name === popoverImportName &&
                            elemName.property.type === 'JSXIdentifier'
                        ) {
                            if (elemName.property.name === 'Root') {
                                parentRoot = currentPath.value;
                                break;
                            }
                            if (elemName.property.name === 'Portal' && !parentPortal) {
                                parentPortal = currentPath.value;
                            }
                        }
                    }
                    currentPath = currentPath.parent;
                }

                let sideOffset: number | null = null;
                let alignOffset: number | null = null;

                attributes.forEach((attr) => {
                    if (attr.type === 'JSXAttribute') {
                        if (attr.name.name === 'sideOffset' && attr.value) {
                            if (attr.value.type === 'StringLiteral') {
                                const stringValue = attr.value.value;
                                const numericValue =
                                    spacePaddingMap[stringValue] ?? Number(stringValue);
                                if (!isNaN(numericValue)) {
                                    sideOffset = numericValue;
                                }
                            }
                        } else if (attr.name.name === 'alignOffset' && attr.value) {
                            if (attr.value.type === 'StringLiteral') {
                                const stringValue = attr.value.value;
                                const numericValue =
                                    spacePaddingMap[stringValue] ?? Number(stringValue);
                                if (!isNaN(numericValue)) {
                                    alignOffset = numericValue;
                                }
                            }
                        }
                    }
                });

                element.openingElement.attributes = attributes.filter((attr) => {
                    if (attr.type === 'JSXAttribute') {
                        return (
                            attr.name.name !== 'sideOffset' &&
                            attr.name.name !== 'alignOffset' &&
                            attr.name.name !== 'isArrowVisible'
                        );
                    }
                    return true;
                });

                const positionerProps: { name: string; value: any }[] = [];

                if (parentRoot) {
                    const rootProps = rootPropsToMove.get(parentRoot);
                    if (rootProps) {
                        if (rootProps.side && rootProps.sideAttr?.value) {
                            positionerProps.push({
                                name: 'side',
                                value: rootProps.sideAttr.value,
                            });
                        }
                        if (rootProps.align && rootProps.alignAttr?.value) {
                            positionerProps.push({
                                name: 'align',
                                value: rootProps.alignAttr.value,
                            });
                        }
                    }
                }

                if (sideOffset !== null) {
                    positionerProps.push({
                        name: 'sideOffset',
                        value: j.jsxExpressionContainer(j.numericLiteral(sideOffset)),
                    });
                }

                if (alignOffset !== null) {
                    positionerProps.push({
                        name: 'alignOffset',
                        value: j.jsxExpressionContainer(j.numericLiteral(alignOffset)),
                    });
                }

                if (positionerProps.length > 0) {
                    const positionerAttrs = positionerProps.map((prop) =>
                        j.jsxAttribute(j.jsxIdentifier(prop.name), prop.value),
                    );

                    const positionerElement = j.jsxElement(
                        j.jsxOpeningElement(
                            j.jsxMemberExpression(
                                j.jsxIdentifier(popoverImportName as string),
                                j.jsxIdentifier('PositionerPrimitive'),
                            ),
                            positionerAttrs,
                            true,
                        ),
                    );

                    element.openingElement.attributes?.push(
                        j.jsxAttribute(
                            j.jsxIdentifier('positionerElement'),
                            j.jsxExpressionContainer(positionerElement),
                        ),
                    );
                }

                if (parentPortal) {
                    const portalProps = portalPropsToMove.get(parentPortal);
                    if (portalProps?.keepMounted) {
                        const portalElement = j.jsxElement(
                            j.jsxOpeningElement(
                                j.jsxMemberExpression(
                                    j.jsxIdentifier(popoverImportName as string),
                                    j.jsxIdentifier('PortalPrimitive'),
                                ),
                                [j.jsxAttribute(j.jsxIdentifier('keepMounted'))],
                                true,
                            ),
                        );

                        element.openingElement.attributes?.push(
                            j.jsxAttribute(
                                j.jsxIdentifier('portalElement'),
                                j.jsxExpressionContainer(portalElement),
                            ),
                        );
                    }
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
