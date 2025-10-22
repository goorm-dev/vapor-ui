import type { API, FileInfo, JSXElement, Transform } from 'jscodeshift';

import {
    getFinalImportName,
    mergeImports,
    migrateImportDeclaration,
} from '~/utils/import-migration';
import {
    transformAsChildToRender,
    transformToMemberExpression,
    updateMemberExpressionObject,
} from '~/utils/jsx-transform';

const SOURCE_PACKAGE = '@goorm-dev/vapor-core';
const TARGET_PACKAGE = '@vapor-ui/core';
const OLD_COMPONENT_NAME = 'Nav';
const NEW_COMPONENT_NAME = 'NavigationMenu';

const transform: Transform = (fileInfo: FileInfo, api: API) => {
    const j = api.jscodeshift;
    const root = j(fileInfo.source);

    // Track the old Nav local name from @goorm-dev/vapor-core
    const oldNavLocalName: string | null = null;

    // 1. Import migration: Nav (default) -> { NavigationMenu } (named)
    root.find(j.ImportDeclaration).forEach((path) => {
        migrateImportDeclaration({
            root,
            j,
            path,
            oldComponentName: OLD_COMPONENT_NAME,
            newComponentName: NEW_COMPONENT_NAME,
            sourcePackage: SOURCE_PACKAGE,
            targetPackage: TARGET_PACKAGE,
        });
    });

    // Merge multiple @vapor-ui/core imports
    mergeImports(root, j, TARGET_PACKAGE);

    // Get the final import name (considering aliases)
    const navigationMenuImportName = getFinalImportName(
        root,
        j,
        NEW_COMPONENT_NAME,
        TARGET_PACKAGE
    );

    // 2. Transform Nav JSX elements to NavigationMenu.Root
    root.find(j.JSXElement).forEach((path) => {
        const element: JSXElement = path.value;

        // Transform <Nav> or <OldNavAlias> to <NavigationMenu.Root>
        if (
            element.openingElement.name.type === 'JSXIdentifier' &&
            (element.openingElement.name.name === OLD_COMPONENT_NAME ||
                (oldNavLocalName && element.openingElement.name.name === oldNavLocalName))
        ) {
            const attributes = element.openingElement.attributes || [];

            // Check if aria-label already exists
            const hasAriaLabel = attributes.some(
                (attr) =>
                    attr.type === 'JSXAttribute' &&
                    attr.name.type === 'JSXIdentifier' &&
                    attr.name.name === 'aria-label'
            );

            // Add aria-label if it doesn't exist
            if (!hasAriaLabel) {
                element.openingElement.attributes?.push(
                    j.jsxAttribute(j.jsxIdentifier('aria-label'), j.stringLiteral('Navigation'))
                );
            }

            // Remove type prop and add warning comment
            const hasTypeProp = attributes.some(
                (attr) =>
                    attr.type === 'JSXAttribute' &&
                    attr.name.type === 'JSXIdentifier' &&
                    attr.name.name === 'type'
            );

            element.openingElement.attributes = attributes.filter((attr) => {
                if (attr.type === 'JSXAttribute' && attr.name.type === 'JSXIdentifier') {
                    return attr.name.name !== 'type';
                }
                return true;
            });

            // Change to NavigationMenu.Root
            transformToMemberExpression(j, element, navigationMenuImportName, 'Root');

            // Transform asChild prop to render prop
            transformAsChildToRender(j, element);

            // Add comment if type prop was removed
            if (hasTypeProp) {
                // Add a JSX comment before the element
                const jsxComment = j.jsxExpressionContainer(j.jsxEmptyExpression());
                jsxComment.expression.comments = [
                    j.commentBlock(
                        ' TODO: The "type" prop has been removed. Please use CSS to customize the navigation style. ',
                        true,
                        false
                    ),
                ];

                // Insert comment as a sibling before the element
                const parent = path.parent.value;
                if (parent && Array.isArray(parent.children)) {
                    const index = parent.children.indexOf(element);
                    if (index !== -1) {
                        parent.children.splice(index, 0, jsxComment, j.jsxText('\n            '));
                    }
                }
            }
        }
    });

    // 3. Transform Nav.* elements to NavigationMenu.* equivalents
    root.find(j.JSXElement).forEach((path) => {
        const element = path.value;

        // Check if this is Nav.* or OldNavAlias.*
        if (
            element.openingElement.name.type === 'JSXMemberExpression' &&
            element.openingElement.name.object.type === 'JSXIdentifier' &&
            (element.openingElement.name.object.name === OLD_COMPONENT_NAME ||
                (oldNavLocalName && element.openingElement.name.object.name === oldNavLocalName))
        ) {
            // Get the property name
            const propertyName =
                element.openingElement.name.property.type === 'JSXIdentifier'
                    ? element.openingElement.name.property.name
                    : null;

            // Replace with the new import name
            updateMemberExpressionObject(element, navigationMenuImportName);

            // Component names stay the same
            // Nav.List -> NavigationMenu.List
            // Nav.Item -> NavigationMenu.Item
            // Nav.Link -> NavigationMenu.Link

            // Handle Link-specific transformations
            if (propertyName === 'Link') {
                const attributes = element.openingElement.attributes || [];

                // Transform active prop to selected
                element.openingElement.attributes = attributes.map((attr) => {
                    if (
                        attr.type === 'JSXAttribute' &&
                        attr.name.type === 'JSXIdentifier' &&
                        attr.name.name === 'active'
                    ) {
                        return j.jsxAttribute(j.jsxIdentifier('selected'), attr.value);
                    }
                    return attr;
                });

                // Remove align prop and add warning comment
                const hasAlignProp = attributes.some(
                    (attr) =>
                        attr.type === 'JSXAttribute' &&
                        attr.name.type === 'JSXIdentifier' &&
                        attr.name.name === 'align'
                );

                element.openingElement.attributes = (
                    element.openingElement.attributes || []
                ).filter((attr) => {
                    if (attr.type === 'JSXAttribute' && attr.name.type === 'JSXIdentifier') {
                        return attr.name.name !== 'align';
                    }
                    return true;
                });

                // Add comment if align prop was removed
                if (hasAlignProp) {
                    // Add a JSX comment before the element
                    const jsxComment = j.jsxExpressionContainer(j.jsxEmptyExpression());
                    jsxComment.expression.comments = [
                        j.commentBlock(
                            ' TODO: The "align" prop has been removed. Please use CSS (text-align or flexbox) to customize alignment. ',
                            true,
                            false
                        ),
                    ];

                    // Insert comment as a sibling before the element
                    const parent = path.parent.value;
                    if (parent && Array.isArray(parent.children)) {
                        const index = parent.children.indexOf(element);
                        if (index !== -1) {
                            parent.children.splice(
                                index,
                                0,
                                jsxComment,
                                j.jsxText('\n                    ')
                            );
                        }
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
