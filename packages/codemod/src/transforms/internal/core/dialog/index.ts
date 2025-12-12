import type { API, FileInfo, ImportSpecifier, Transform } from 'jscodeshift';

import {
    cleanUpSourcePackage,
    collectImportSpecifiersToMove,
    createNewImportDeclaration,
    mergeIntoExistingImport,
    transformSpecifier,
} from '~/utils/import-transform';
import {
    transformAsChildToRender,
    transformForceMountToKeepMounted,
    transformToMemberExpression,
    updateMemberExpressionObject,
} from '~/utils/jsx-transform';

const SOURCE_PACKAGE = '@goorm-dev/vapor-core';
const TARGET_PACKAGE = '@vapor-ui/core';

const transform: Transform = (fileInfo: FileInfo, api: API) => {
    const j = api.jscodeshift;
    const root = j(fileInfo.source);

    const allSpecifiers: ImportSpecifier[] = collectImportSpecifiersToMove(j, root, SOURCE_PACKAGE);

    const specifiersToMove = allSpecifiers.filter((spec) => spec.imported.name === 'Dialog');

    if (specifiersToMove.length === 0) {
        return root.toSource();
    }

    const oldDialogImportName =
        specifiersToMove.find((spec) => spec.imported.name === 'Dialog')?.local?.name || 'Dialog';

    const transformedSpecifiers = transformSpecifier(j, specifiersToMove, {});

    const dialogImportName = oldDialogImportName as string;
    // 2. Transform Dialog JSX elements to Dialog.Root
    root.find(j.JSXElement).forEach((path) => {
        const element = path.value;

        // Transform <Dialog> or <OldDialogAlias> to <dialogImportName.Root>
        if (
            element.openingElement.name.type === 'JSXIdentifier' &&
            element.openingElement.name.name === oldDialogImportName
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
            element.openingElement.name.object.name === oldDialogImportName
        ) {
            // Get the property name (Contents, CombinedContent, Content, etc.)
            const propertyName =
                element.openingElement.name.property.type === 'JSXIdentifier'
                    ? element.openingElement.name.property.name
                    : null;

            // Replace with the new import name
            updateMemberExpressionObject(element, dialogImportName);

            // Transform Contents and CombinedContent to Popup
            if (propertyName === 'Contents' || propertyName === 'CombinedContent') {
                element.openingElement.name.property = j.jsxIdentifier('Popup');
                if (
                    element.closingElement &&
                    element.closingElement.name.type === 'JSXMemberExpression'
                ) {
                    element.closingElement.name.property = j.jsxIdentifier('Popup');
                }
            }

            // Transform Content to PopupPrimitive when inside Portal
            if (propertyName === 'Content') {
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
                        element.openingElement.name.property = j.jsxIdentifier('PopupPrimitive');
                        if (
                            element.closingElement &&
                            element.closingElement.name.type === 'JSXMemberExpression'
                        ) {
                            element.closingElement.name.property =
                                j.jsxIdentifier('PopupPrimitive');
                        }
                    }
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
