import type { API, FileInfo, Transform } from 'jscodeshift';

import {
    getFinalImportName,
    hasComponentInPackage,
    transformImportDeclaration,
} from '~/utils/import-transform';
import {
    transformAsChildToRender,
    transformToMemberExpression,
    updateMemberExpressionObject,
} from '~/utils/jsx-transform';

const SOURCE_PACKAGE = '@goorm-dev/vapor-core';
const TARGET_PACKAGE = '@vapor-ui/core';

const OLD_COMPONENT_NAME = 'Card';
const NEW_COMPONENT_NAME = 'Card';

const transform: Transform = (fileInfo: FileInfo, api: API) => {
    const j = api.jscodeshift;
    const root = j(fileInfo.source);

    if (!hasComponentInPackage(root, j, OLD_COMPONENT_NAME, SOURCE_PACKAGE)) {
        return fileInfo.source;
    }

    // 1. Import migration: Alert -> Callout
    transformImportDeclaration({
        root,
        j,
        oldComponentName: OLD_COMPONENT_NAME,
        newComponentName: NEW_COMPONENT_NAME,
        sourcePackage: SOURCE_PACKAGE,
        targetPackage: TARGET_PACKAGE,
    });
    // Get the final import name (considering aliases)
    const cardImportName = getFinalImportName(root, j, NEW_COMPONENT_NAME, TARGET_PACKAGE);

    // 2. Transform Card JSX elements to Card.Root (or alias.Root)
    root.find(j.JSXElement).forEach((path) => {
        const element = path.value;

        // Transform <Card> or <OldCardAlias> to <cardImportName.Root>
        // Check if this is the old Card (either 'Card' or its alias from vapor-core)
        if (
            element.openingElement.name.type === 'JSXIdentifier' &&
            element.openingElement.name.name === cardImportName
        ) {
            // Change to cardImportName.Root
            transformToMemberExpression(j, element, cardImportName, 'Root');

            // Transform asChild prop to render prop
            transformAsChildToRender(j, element);
        }
    });

    // 2.5. Transform Card.* elements to use the alias (e.g., Card.Body -> cardImportName.Body)
    // Also handles old aliases (e.g., CoreCard.Body -> cardImportName.Body)
    root.find(j.JSXElement).forEach((path) => {
        const element = path.value;

        // Check if this is Card.* or OldCardAlias.* (e.g., Card.Body, CoreCard.Body, etc.)
        if (
            element.openingElement.name.type === 'JSXMemberExpression' &&
            element.openingElement.name.object.type === 'JSXIdentifier' &&
            element.openingElement.name.object.name === cardImportName
        ) {
            // Replace with the new import name (cardImportName)
            updateMemberExpressionObject(element, cardImportName);
        }
    });

    // 3. Remove Card.Title wrapper but keep children (using detected import name/alias)
    root.find(j.JSXElement).forEach((path) => {
        const element = path.value;

        // Check if this is Card.Title (or alias.Title)
        if (
            element.openingElement.name.type === 'JSXMemberExpression' &&
            element.openingElement.name.object.type === 'JSXIdentifier' &&
            element.openingElement.name.object.name === cardImportName &&
            element.openingElement.name.property.type === 'JSXIdentifier' &&
            element.openingElement.name.property.name === 'Title'
        ) {
            // Find parent element to replace Card.Title
            const parentPath = path.parent;

            if (parentPath && parentPath.value) {
                // Create TODO comment
                const todoComment = j.jsxExpressionContainer(
                    j.jsxEmptyExpression.from({
                        comments: [
                            j.commentLine(
                                ' TODO: Card.Title removed - consider using Text component or custom heading',
                                true,
                                false,
                            ),
                        ],
                    }),
                );

                // Get children of Card.Title
                const titleChildren = element.children || [];

                // Replace Card.Title element with TODO comment + children
                if (parentPath.value.type === 'JSXElement') {
                    const parentChildren = parentPath.value.children;
                    if (parentChildren) {
                        const titleIndex = parentChildren.indexOf(element);
                        if (titleIndex !== -1) {
                            // Replace Card.Title with TODO comment and its children
                            parentChildren.splice(titleIndex, 1, todoComment, ...titleChildren);
                        }
                    }
                }
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
