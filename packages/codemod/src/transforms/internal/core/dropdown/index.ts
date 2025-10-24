import type { API, FileInfo, JSXAttribute, JSXElement, Transform } from 'jscodeshift';

import { getFinalImportName, transformImportDeclaration } from '~/utils/import-transform';
import {
    transformAsChildToRender,
    transformForceMountToKeepMounted,
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

    // Track the old Dropdown local name from @goorm-dev/vapor-core

    // 1. Import migration: Dropdown (named) -> { Menu } (named with rename)
    transformImportDeclaration({
        root,
        j,
        oldComponentName: OLD_COMPONENT_NAME,
        newComponentName: NEW_COMPONENT_NAME,
        sourcePackage: SOURCE_PACKAGE,
        targetPackage: TARGET_PACKAGE,
    });

    // Merge multiple @vapor-ui/core imports

    // Get the final import name (considering aliases)
    const menuImportName = getFinalImportName(root, j, NEW_COMPONENT_NAME, TARGET_PACKAGE);

    // Track side and align props from Dropdown root to move to Content
    const rootPropsToMove = new Map<
        JSXElement,
        {
            side?: string | null;
            align?: string | null;
            sideAttr?: JSXAttribute;
            alignAttr?: JSXAttribute;
        }
    >();

    // 2. Transform Dropdown JSX elements to Menu.Root
    root.find(j.JSXElement).forEach((path) => {
        const element: JSXElement = path.value;

        // Transform <Dropdown> or <OldDropdownAlias> to <Menu.Root>
        if (
            element.openingElement.name.type === 'JSXIdentifier' &&
            element.openingElement.name.name === OLD_COMPONENT_NAME
        ) {
            // Store side and align props to move to Content later
            const attributes = element.openingElement.attributes || [];
            let side: string | null = null;
            let align: string | null = null;
            let sideAttr: JSXAttribute | undefined;
            let alignAttr: JSXAttribute | undefined;

            // Extract side and align values
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

            // Remove side and align from Root
            element.openingElement.attributes = attributes.filter((attr) => {
                if (attr.type === 'JSXAttribute') {
                    return attr.name.name !== 'side' && attr.name.name !== 'align';
                }
                return true;
            });

            // Change to Menu.Root
            transformToMemberExpression(j, element, menuImportName, 'Root');

            // Transform asChild prop to render prop
            transformAsChildToRender(j, element);
        }
    });

    // 3. Transform Dropdown.* elements to Menu.* equivalents
    root.find(j.JSXElement).forEach((path) => {
        const element = path.value;

        // Check if this is Dropdown.* or OldDropdownAlias.*
        if (
            element.openingElement.name.type === 'JSXMemberExpression' &&
            element.openingElement.name.object.type === 'JSXIdentifier' &&
            element.openingElement.name.object.name === OLD_COMPONENT_NAME
        ) {
            // Get the property name
            const propertyName =
                element.openingElement.name.property.type === 'JSXIdentifier'
                    ? element.openingElement.name.property.name
                    : null;

            // Replace with the new import name
            updateMemberExpressionObject(element, menuImportName);

            // Map component names
            let newPropertyName = propertyName;
            switch (propertyName) {
                case 'Contents':
                case 'CombinedContent':
                    newPropertyName = 'Content';
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
                case 'SubContent':
                    newPropertyName = 'SubmenuContent';
                    break;
                // Trigger, Portal, Group, Item stay the same
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

            // Handle Portal-specific transformations
            if (propertyName === 'Portal') {
                transformForceMountToKeepMounted(j, element);
            }

            // Handle Content-specific transformations
            if (newPropertyName === 'Content') {
                const attributes = element.openingElement.attributes || [];

                // Find parent Root to check if we need to move side/align props
                let parentRoot: JSXElement | null = null;
                let currentPath = path.parent;
                while (currentPath && currentPath.value) {
                    if (
                        currentPath.value.type === 'JSXElement' &&
                        currentPath.value.openingElement.name.type === 'JSXMemberExpression' &&
                        currentPath.value.openingElement.name.object.type === 'JSXIdentifier' &&
                        currentPath.value.openingElement.name.object.name === menuImportName &&
                        currentPath.value.openingElement.name.property.type === 'JSXIdentifier' &&
                        currentPath.value.openingElement.name.property.name === 'Root'
                    ) {
                        parentRoot = currentPath.value;
                        break;
                    }
                    currentPath = currentPath.parent;
                }

                // Move side and align props from Root to Content's positionerProps
                if (parentRoot) {
                    const rootProps = rootPropsToMove.get(parentRoot);
                    if (rootProps && (rootProps.side || rootProps.align)) {
                        // Build positionerProps object
                        const positionerPropsObj = j.objectExpression([]);

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
                                    rootProps.alignAttr.value || j.stringLiteral('start')
                                )
                            );
                        }

                        // Add positionerProps attribute
                        if (positionerPropsObj.properties.length > 0) {
                            element.openingElement.attributes?.push(
                                j.jsxAttribute(
                                    j.jsxIdentifier('positionerProps'),
                                    j.jsxExpressionContainer(positionerPropsObj)
                                )
                            );
                        }
                    }
                }

                // Convert maxHeight prop to style prop
                let maxHeightValue: string | null = null;
                element.openingElement.attributes = attributes
                    .map((attr) => {
                        if (attr.type === 'JSXAttribute' && attr.name.name === 'maxHeight') {
                            if (attr.value && attr.value.type === 'StringLiteral') {
                                maxHeightValue = attr.value.value;
                            }
                            return null; // Remove maxHeight prop
                        }
                        return attr;
                    })
                    .filter((attr): attr is JSXAttribute => attr !== null);

                // Add style prop with maxHeight if it was present
                if (maxHeightValue) {
                    const existingStyleAttr = element.openingElement.attributes?.find(
                        (attr) => attr.type === 'JSXAttribute' && attr.name.name === 'style'
                    );

                    if (existingStyleAttr && existingStyleAttr.type === 'JSXAttribute') {
                        // Merge with existing style
                        if (
                            existingStyleAttr.value &&
                            existingStyleAttr.value.type === 'JSXExpressionContainer' &&
                            existingStyleAttr.value.expression.type === 'ObjectExpression'
                        ) {
                            existingStyleAttr.value.expression.properties.push(
                                j.objectProperty(
                                    j.identifier('maxHeight'),
                                    j.stringLiteral(maxHeightValue)
                                )
                            );
                        }
                    } else {
                        // Add new style prop
                        element.openingElement.attributes?.push(
                            j.jsxAttribute(
                                j.jsxIdentifier('style'),
                                j.jsxExpressionContainer(
                                    j.objectExpression([
                                        j.objectProperty(
                                            j.identifier('maxHeight'),
                                            j.stringLiteral(maxHeightValue)
                                        ),
                                    ])
                                )
                            )
                        );
                    }
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
