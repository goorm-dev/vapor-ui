import type {
    API,
    ASTNode,
    FileInfo,
    ImportSpecifier,
    JSXAttribute,
    JSXSpreadAttribute,
    Transform,
} from 'jscodeshift';

import {
    getFinalImportName,
    hasComponentInPackage,
    transformImportDeclaration,
} from '~/utils/import-transform';
import { transformAsChildToRender, transformToMemberExpression } from '~/utils/jsx-transform';

const SOURCE_PACKAGE = '@goorm-dev/vapor-core';
const TARGET_PACKAGE = '@vapor-ui/core';
const OLD_COMPONENT_NAME = 'Checkbox';
const NEW_COMPONENT_NAME = 'Checkbox';

const transform: Transform = (fileInfo: FileInfo, api: API) => {
    const j = api.jscodeshift;
    const root = j(fileInfo.source);

    if (!hasComponentInPackage(root, j, OLD_COMPONENT_NAME, SOURCE_PACKAGE)) {
        return fileInfo.source;
    }

    // 1. Import migration: Checkbox -> Checkbox
    transformImportDeclaration({
        root,
        j,
        oldComponentName: OLD_COMPONENT_NAME,
        newComponentName: NEW_COMPONENT_NAME,
        sourcePackage: SOURCE_PACKAGE,
        targetPackage: TARGET_PACKAGE,
    });

    // Get the final import name (considering aliases)
    const checkboxImportName = getFinalImportName(root, j, NEW_COMPONENT_NAME, TARGET_PACKAGE);

    // Track if Field import is needed
    let needsFieldImport = false;

    // 2. First pass: Check if we need to add Field import (if Checkbox.Label exists)
    root.find(j.JSXElement).forEach((path) => {
        const element = path.value;
        if (
            element.openingElement.name.type === 'JSXMemberExpression' &&
            element.openingElement.name.object.type === 'JSXIdentifier' &&
            element.openingElement.name.object.name === 'Checkbox' &&
            element.openingElement.name.property.type === 'JSXIdentifier' &&
            element.openingElement.name.property.name === 'Label'
        ) {
            needsFieldImport = true;
        }
    });

    // Add Field import if needed
    if (needsFieldImport) {
        const existingFieldImport = root.find(j.ImportDeclaration, {
            source: { value: TARGET_PACKAGE },
        });

        if (existingFieldImport.length > 0) {
            const importDecl = existingFieldImport.at(0).get().value;
            const hasField = importDecl.specifiers?.some(
                (spec: ImportSpecifier) =>
                    spec.type === 'ImportSpecifier' && spec.imported.name === 'Field',
            );

            if (!hasField) {
                importDecl.specifiers?.push(j.importSpecifier(j.identifier('Field')));
            }
        }
    }

    // 3. Transform Checkbox JSX elements to Checkbox.Root
    root.find(j.JSXElement).forEach((path) => {
        const element = path.value;

        if (
            element.openingElement.name.type === 'JSXIdentifier' &&
            element.openingElement.name.name === 'Checkbox'
        ) {
            // Change to checkboxImportName.Root
            transformToMemberExpression(j, element, checkboxImportName, 'Root');

            // Transform asChild prop to render prop
            transformAsChildToRender(j, element);

            // Handle props transformation
            const attributes = element.openingElement.attributes || [];
            const newAttributes: (JSXAttribute | JSXSpreadAttribute)[] = [];
            let hasOnCheckedChange = false;
            let hasCheckedExpression = false;

            attributes.forEach((attr) => {
                if (attr.type === 'JSXAttribute') {
                    // Track onCheckedChange for TODO comment
                    if (attr.name.name === 'onCheckedChange') {
                        hasOnCheckedChange = true;
                        newAttributes.push(attr);
                    }
                    // Transform checked='indeterminate' to indeterminate={true}
                    else if (attr.name.name === 'checked') {
                        if (
                            attr.value &&
                            attr.value.type === 'StringLiteral' &&
                            attr.value.value === 'indeterminate'
                        ) {
                            // Add indeterminate prop instead
                            newAttributes.push(
                                j.jsxAttribute(
                                    j.jsxIdentifier('indeterminate'),
                                    j.jsxExpressionContainer(j.booleanLiteral(true)),
                                ),
                            );
                        } else {
                            // Track if checked is an expression (could be 'indeterminate')
                            if (
                                attr.value &&
                                attr.value.type === 'JSXExpressionContainer' &&
                                attr.value.expression.type !== 'JSXEmptyExpression'
                            ) {
                                hasCheckedExpression = true;
                            }
                            newAttributes.push(attr);
                        }
                    } else {
                        newAttributes.push(attr);
                    }
                } else {
                    newAttributes.push(attr);
                }
            });

            element.openingElement.attributes = newAttributes;

            // Add TODO comment if onCheckedChange exists or checked is an expression
            const comments: Array<ReturnType<typeof j.commentLine>> = [];
            if (hasOnCheckedChange) {
                comments.push(
                    j.commentLine(
                        ' TODO: onCheckedChange signature changed - now receives (checked: boolean, event: Event) instead of (checked: CheckedState)',
                        true,
                        false,
                    ),
                );
            }
            if (hasCheckedExpression) {
                comments.push(
                    j.commentLine(
                        " TODO: If checked can be 'indeterminate', split the logic: use indeterminate prop for indeterminate state and checked prop for boolean",
                        true,
                        false,
                    ),
                );
            }
            if (comments.length > 0) {
                element.comments = [...(element.comments || []), ...comments];
            }
        }
    });

    // 4. Replace Checkbox.Label with Field.Label wrapper
    // Find Checkbox.Root elements that contain Checkbox.Label as a child
    root.find(j.JSXElement).forEach((path) => {
        const element = path.value;

        // Check if this is a Checkbox.Root element (already transformed)
        if (
            element.openingElement.name.type === 'JSXMemberExpression' &&
            element.openingElement.name.object.type === 'JSXIdentifier' &&
            element.openingElement.name.object.name === checkboxImportName &&
            element.openingElement.name.property.type === 'JSXIdentifier' &&
            element.openingElement.name.property.name === 'Root'
        ) {
            // Check if this Checkbox.Root has Checkbox.Label as a child
            const children = element.children || [];
            let labelElement: ASTNode | null = null;
            let labelIndex = -1;

            children.forEach((child: ASTNode, index: number) => {
                if (
                    child.type === 'JSXElement' &&
                    child.openingElement.name.type === 'JSXMemberExpression' &&
                    child.openingElement.name.object.type === 'JSXIdentifier' &&
                    child.openingElement.name.object.name === checkboxImportName &&
                    child.openingElement.name.property.type === 'JSXIdentifier' &&
                    child.openingElement.name.property.name === 'Label'
                ) {
                    labelElement = child;
                    labelIndex = index;
                }
            });

            if (labelElement && labelIndex !== -1) {
                // Get children of Checkbox.Label (the label text)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const labelChildren = (labelElement as any).children || [];

                // Remove Checkbox.Label from Checkbox.Root children
                children.splice(labelIndex, 1);

                // Create Field.Label wrapping Checkbox.Root and label text
                const fieldLabel = j.jsxElement(
                    j.jsxOpeningElement(
                        j.jsxMemberExpression(j.jsxIdentifier('Field'), j.jsxIdentifier('Label')),
                        [],
                    ),
                    j.jsxClosingElement(
                        j.jsxMemberExpression(j.jsxIdentifier('Field'), j.jsxIdentifier('Label')),
                    ),
                    [
                        j.jsxText('\n  '),
                        element,
                        j.jsxText('\n  '),
                        ...labelChildren,
                        j.jsxText('\n'),
                    ],
                );

                // Replace Checkbox.Root with Field.Label in parent
                const parentPath = path.parent;
                if (parentPath && parentPath.value && parentPath.value.type === 'JSXElement') {
                    const parentChildren = parentPath.value.children;
                    if (parentChildren) {
                        const checkboxIndex = parentChildren.indexOf(element);
                        if (checkboxIndex !== -1) {
                            parentChildren[checkboxIndex] = fieldLabel;
                        }
                    }
                }
            }
        }
    });

    // 5. Transform Checkbox.* elements to use the alias
    root.find(j.JSXElement).forEach((path) => {
        const element = path.value;

        if (
            element.openingElement.name.type === 'JSXMemberExpression' &&
            element.openingElement.name.object.type === 'JSXIdentifier' &&
            element.openingElement.name.object.name === 'Checkbox'
        ) {
            // Replace with the new import name (checkboxImportName)
            element.openingElement.name.object.name = checkboxImportName;

            if (
                element.closingElement &&
                element.closingElement.name.type === 'JSXMemberExpression' &&
                element.closingElement.name.object.type === 'JSXIdentifier'
            ) {
                element.closingElement.name.object.name = checkboxImportName;
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
