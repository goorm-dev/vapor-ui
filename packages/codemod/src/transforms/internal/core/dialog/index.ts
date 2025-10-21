import type {
    API,
    FileInfo,
    JSXElement,
    JSXExpressionContainer,
    JSXFragment,
    JSXSpreadChild,
    JSXText,
    Transform,
} from 'jscodeshift';

import { getFinalImportName, mergeImports, migrateImportSpecifier } from '~/utils/import-migration';
import {
    transformAsChildToRender,
    transformForceMountToKeepMounted,
    transformToMemberExpression,
    updateMemberExpressionObject,
} from '~/utils/jsx-transform';

const SOURCE_PACKAGE = '@goorm-dev/vapor-core';
const TARGET_PACKAGE = '@vapor-ui/core';
const COMPONENT_NAME = 'Dialog';

const transform: Transform = (fileInfo: FileInfo, api: API) => {
    const j = api.jscodeshift;
    const root = j(fileInfo.source);

    // Track the old Dialog local name from @goorm-dev/vapor-core
    let oldDialogLocalName: string | null = null;

    // 1. Import migration: Dialog (default) -> { Dialog } (named)
    // Note: vapor-core uses default export, vapor-ui uses named export
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
            oldDialogLocalName = componentInfo.localName;
        }
    });

    // Merge multiple @vapor-ui/core imports
    mergeImports(root, j, TARGET_PACKAGE);

    // Get the final import name (considering aliases)
    const dialogImportName = getFinalImportName(root, j, COMPONENT_NAME, TARGET_PACKAGE);

    // 2. Transform Dialog JSX elements to Dialog.Root
    root.find(j.JSXElement).forEach((path) => {
        const element = path.value;

        // Transform <Dialog> or <OldDialogAlias> to <dialogImportName.Root>
        if (
            element.openingElement.name.type === 'JSXIdentifier' &&
            (element.openingElement.name.name === 'Dialog' ||
                (oldDialogLocalName && element.openingElement.name.name === oldDialogLocalName))
        ) {
            // Change to dialogImportName.Root
            transformToMemberExpression(j, element, dialogImportName, 'Root');

            // Transform scrimClickable prop to closeOnClickOverlay
            const attributes = element.openingElement.attributes || [];
            element.openingElement.attributes = attributes.map((attr) => {
                if (attr.type === 'JSXAttribute' && attr.name.name === 'scrimClickable') {
                    return j.jsxAttribute(j.jsxIdentifier('closeOnClickOverlay'), attr.value);
                }
                return attr;
            });

            // Transform asChild prop to render prop
            transformAsChildToRender(j, element);
        }
    });

    // 3. Transform Dialog.* elements to use the alias
    root.find(j.JSXElement).forEach((path) => {
        const element = path.value;

        // Check if this is Dialog.* or OldDialogAlias.*
        if (
            element.openingElement.name.type === 'JSXMemberExpression' &&
            element.openingElement.name.object.type === 'JSXIdentifier' &&
            (element.openingElement.name.object.name === 'Dialog' ||
                (oldDialogLocalName &&
                    element.openingElement.name.object.name === oldDialogLocalName))
        ) {
            // Get the property name (Contents, CombinedContent, Content, etc.)
            const propertyName =
                element.openingElement.name.property.type === 'JSXIdentifier'
                    ? element.openingElement.name.property.name
                    : null;

            // Replace with the new import name
            updateMemberExpressionObject(element, dialogImportName);

            // Transform Contents and CombinedContent to Content
            if (propertyName === 'Contents' || propertyName === 'CombinedContent') {
                element.openingElement.name.property = j.jsxIdentifier('Content');
                if (
                    element.closingElement &&
                    element.closingElement.name.type === 'JSXMemberExpression'
                ) {
                    element.closingElement.name.property = j.jsxIdentifier('Content');
                }
            }

            // Transform forceMount prop to keepMounted for Portal
            if (propertyName === 'Portal') {
                transformForceMountToKeepMounted(j, element);
            }

            // Transform asChild prop to render prop for all sub-components
            transformAsChildToRender(j, element);
        }
    });

    // 4. Transform Dialog.Content to Dialog.Popup when inside Dialog.Portal with explicit Overlay
    // This needs to be done in a separate pass to check parent context
    root.find(j.JSXElement).forEach((path) => {
        const element = path.value;

        // Check if this is Dialog.Content (after transformation)
        if (
            element.openingElement.name.type === 'JSXMemberExpression' &&
            element.openingElement.name.object.type === 'JSXIdentifier' &&
            element.openingElement.name.object.name === dialogImportName &&
            element.openingElement.name.property.type === 'JSXIdentifier' &&
            element.openingElement.name.property.name === 'Content'
        ) {
            // Check if parent is Dialog.Portal
            const parentPath = path.parent;
            if (parentPath && parentPath.value && parentPath.value.type === 'JSXElement') {
                const parentElement = parentPath.value;
                const isInsidePortal =
                    parentElement.openingElement.name.type === 'JSXMemberExpression' &&
                    parentElement.openingElement.name.object.type === 'JSXIdentifier' &&
                    parentElement.openingElement.name.object.name === dialogImportName &&
                    parentElement.openingElement.name.property.type === 'JSXIdentifier' &&
                    parentElement.openingElement.name.property.name === 'Portal';

                if (isInsidePortal) {
                    // Check if there's a sibling Dialog.Overlay
                    const siblings = parentElement.children || [];
                    const hasOverlay = siblings.some(
                        (
                            sibling:
                                | JSXText
                                | JSXExpressionContainer
                                | JSXSpreadChild
                                | JSXElement
                                | JSXFragment
                        ) => {
                            return (
                                sibling.type === 'JSXElement' &&
                                sibling.openingElement.name.type === 'JSXMemberExpression' &&
                                sibling.openingElement.name.object.type === 'JSXIdentifier' &&
                                sibling.openingElement.name.object.name === dialogImportName &&
                                sibling.openingElement.name.property.type === 'JSXIdentifier' &&
                                sibling.openingElement.name.property.name === 'Overlay'
                            );
                        }
                    );

                    // If inside Portal with Overlay sibling, transform to Popup
                    if (hasOverlay) {
                        element.openingElement.name.property = j.jsxIdentifier('Popup');
                        if (
                            element.closingElement &&
                            element.closingElement.name.type === 'JSXMemberExpression'
                        ) {
                            element.closingElement.name.property = j.jsxIdentifier('Popup');
                        }
                    }
                }
            }
        }
    });

    return root.toSource();
};

export default transform;
export const parser = 'tsx';
