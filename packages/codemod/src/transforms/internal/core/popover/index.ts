import type { API, FileInfo, JSXAttribute, JSXElement, Transform } from 'jscodeshift';

import { getFinalImportName, mergeImports, migrateImportSpecifier } from '~/utils/import-migration';
import {
    transformAsChildToRender,
    transformForceMountToKeepMounted,
    transformToMemberExpression,
    updateMemberExpressionObject,
} from '~/utils/jsx-transform';

const SOURCE_PACKAGE = '@goorm-dev/vapor-core';
const TARGET_PACKAGE = '@vapor-ui/core';
const COMPONENT_NAME = 'Popover';

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

    // Track the old Popover local name from @goorm-dev/vapor-core
    let oldPopoverLocalName: string | null = null;

    // 1. Import migration: Popover (named) -> { Popover } (named)
    root.find(j.ImportDeclaration).forEach((path) => {
        const componentInfo = migrateImportSpecifier(
            root,
            j,
            path,
            COMPONENT_NAME,
            SOURCE_PACKAGE,
            TARGET_PACKAGE
        );

        if (componentInfo) {
            oldPopoverLocalName = componentInfo.localName;
        }
    });

    // Merge multiple @vapor-ui/core imports
    mergeImports(root, j, TARGET_PACKAGE);

    // Get the final import name (considering aliases)
    const popoverImportName = getFinalImportName(root, j, COMPONENT_NAME, TARGET_PACKAGE);

    // Track side and align props from Popover root to move to Content
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

    // 2. Transform Popover JSX elements to Popover.Root
    root.find(j.JSXElement).forEach((path) => {
        const element: JSXElement = path.value;

        // Transform <Popover> or <OldPopoverAlias> to <Popover.Root>
        if (
            element.openingElement.name.type === 'JSXIdentifier' &&
            (element.openingElement.name.name === COMPONENT_NAME ||
                (oldPopoverLocalName && element.openingElement.name.name === oldPopoverLocalName))
        ) {
            // Store side, align, and disabled props to move later
            const attributes = element.openingElement.attributes || [];
            let side: string | null = null;
            let align: string | null = null;
            let sideAttr: JSXAttribute | undefined;
            let alignAttr: JSXAttribute | undefined;
            let disabledAttr: JSXAttribute | undefined;

            // Extract side, align, and disabled values
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

            // Remove side, align, and disabled from Root
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

            // Change to Popover.Root
            transformToMemberExpression(j, element, popoverImportName, 'Root');

            // Transform asChild prop to render prop
            transformAsChildToRender(j, element);
        }
    });

    // Track Content props to move to positionerProps
    const contentPropsToMove = new Map<
        JSXElement,
        {
            sideOffset?: number | null;
            alignOffset?: number | null;
            sideOffsetAttr?: JSXAttribute;
            alignOffsetAttr?: JSXAttribute;
        }
    >();

    // 3. Transform Popover.* elements to Popover.* equivalents
    root.find(j.JSXElement).forEach((path) => {
        const element = path.value;

        // Check if this is Popover.* or OldPopoverAlias.*
        if (
            element.openingElement.name.type === 'JSXMemberExpression' &&
            element.openingElement.name.object.type === 'JSXIdentifier' &&
            (element.openingElement.name.object.name === COMPONENT_NAME ||
                (oldPopoverLocalName &&
                    element.openingElement.name.object.name === oldPopoverLocalName))
        ) {
            // Get the property name
            const propertyName =
                element.openingElement.name.property.type === 'JSXIdentifier'
                    ? element.openingElement.name.property.name
                    : null;

            // Replace with the new import name
            updateMemberExpressionObject(element, popoverImportName);

            // Map component names
            let newPropertyName = propertyName;
            switch (propertyName) {
                case 'CombinedContent':
                    newPropertyName = 'Content';
                    break;
                case 'Arrow':
                    // Arrow is now automatically included in Popup, so we remove it
                    // Mark for removal by setting to null
                    newPropertyName = null;
                    break;
                case 'Anchor':
                    // Anchor is removed from the new API
                    newPropertyName = null;
                    break;
                // Trigger, Portal, Content, Close stay the same
            }

            // Handle Arrow and Anchor removal
            if (propertyName === 'Arrow' || propertyName === 'Anchor') {
                // For Anchor, we need to preserve its children by moving them to the parent
                if (propertyName === 'Anchor' && element.children) {
                    if (path.parent && path.parent.value.type === 'JSXElement') {
                        const parentElement = path.parent.value as JSXElement;
                        if (parentElement.children) {
                            // Find the index of the Anchor element
                            const anchorIndex = parentElement.children.indexOf(element);
                            if (anchorIndex !== -1) {
                                // Replace Anchor with its children
                                parentElement.children.splice(anchorIndex, 1, ...element.children);
                            }
                        }
                    }
                } else {
                    // For Arrow, just remove it
                    if (path.parent && path.parent.value.type === 'JSXElement') {
                        const parentElement = path.parent.value as JSXElement;
                        if (parentElement.children) {
                            parentElement.children = parentElement.children.filter(
                                (child) => child !== element
                            );
                        }
                    }
                }
                return; // Skip further processing for Arrow and Anchor
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

            // Handle Trigger-specific transformations
            if (propertyName === 'Trigger') {
                // Find parent Root to check if we need to move disabled prop
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

                // Add disabled from Root if available
                if (parentRoot) {
                    const rootProps = rootPropsToMove.get(parentRoot);
                    if (rootProps && rootProps.disabledAttr) {
                        // Add disabled to Trigger
                        element.openingElement.attributes = element.openingElement.attributes || [];
                        element.openingElement.attributes.push(rootProps.disabledAttr);
                    }
                }
            }

            // Handle Portal-specific transformations
            if (propertyName === 'Portal') {
                transformForceMountToKeepMounted(j, element);
            }

            // Handle Content-specific transformations
            if (newPropertyName === 'Content' || propertyName === 'Content') {
                const attributes = element.openingElement.attributes || [];

                // Find parent Root to check if we need to move side/align props
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

                // Extract sideOffset and alignOffset to move to positionerProps
                let sideOffset: number | null = null;
                let alignOffset: number | null = null;
                let sideOffsetAttr: JSXAttribute | undefined;
                let alignOffsetAttr: JSXAttribute | undefined;

                attributes.forEach((attr) => {
                    if (attr.type === 'JSXAttribute') {
                        if (attr.name.name === 'sideOffset' && attr.value) {
                            sideOffsetAttr = attr;
                            if (attr.value.type === 'StringLiteral') {
                                const stringValue = attr.value.value;
                                // Try spacePaddingMap first, then parse as number
                                const numericValue =
                                    spacePaddingMap[stringValue] ?? Number(stringValue);
                                if (!isNaN(numericValue)) {
                                    sideOffset = numericValue;
                                }
                            }
                        } else if (attr.name.name === 'alignOffset' && attr.value) {
                            alignOffsetAttr = attr;
                            if (attr.value.type === 'StringLiteral') {
                                const stringValue = attr.value.value;
                                // Try spacePaddingMap first, then parse as number
                                const numericValue =
                                    spacePaddingMap[stringValue] ?? Number(stringValue);
                                if (!isNaN(numericValue)) {
                                    alignOffset = numericValue;
                                }
                            }
                        }
                    }
                });

                if (sideOffset || alignOffset) {
                    contentPropsToMove.set(element, {
                        sideOffset,
                        alignOffset,
                        sideOffsetAttr,
                        alignOffsetAttr,
                    });
                }

                // Build positionerProps object
                const positionerPropsObj = j.objectExpression([]);

                // Add side and align from Root if available
                if (parentRoot) {
                    const rootProps = rootPropsToMove.get(parentRoot);
                    if (rootProps) {
                        if (rootProps.side && rootProps.sideAttr) {
                            positionerPropsObj.properties.push(
                                j.objectProperty(
                                    j.identifier('side'),
                                    rootProps.sideAttr.value || j.stringLiteral('bottom')
                                )
                            );
                        }

                        if (rootProps.align && rootProps.alignAttr) {
                            positionerPropsObj.properties.push(
                                j.objectProperty(
                                    j.identifier('align'),
                                    rootProps.alignAttr.value || j.stringLiteral('center')
                                )
                            );
                        }
                    }
                }

                // Add sideOffset and alignOffset to positionerProps
                if (sideOffset !== null) {
                    positionerPropsObj.properties.push(
                        j.objectProperty(j.identifier('sideOffset'), j.numericLiteral(sideOffset))
                    );
                }

                if (alignOffset !== null) {
                    positionerPropsObj.properties.push(
                        j.objectProperty(j.identifier('alignOffset'), j.numericLiteral(alignOffset))
                    );
                }

                // Remove sideOffset, alignOffset, and isArrowVisible from Content
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

                // Add positionerProps attribute if we have any props to move
                if (positionerPropsObj.properties.length > 0) {
                    element.openingElement.attributes?.push(
                        j.jsxAttribute(
                            j.jsxIdentifier('positionerProps'),
                            j.jsxExpressionContainer(positionerPropsObj)
                        )
                    );
                }
            }

            // Transform asChild prop to render prop for all sub-components
            transformAsChildToRender(j, element);
        }
    });

    return root.toSource();
};

export default transform;
export const parser = 'tsx';
