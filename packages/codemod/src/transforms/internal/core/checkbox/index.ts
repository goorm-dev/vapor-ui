import type { API, FileInfo, Transform } from 'jscodeshift';

import { getFinalImportName, mergeImports, migrateImportSpecifier } from '~/utils/import-migration';
import { transformAsChildToRender, transformToMemberExpression } from '~/utils/jsx-transform';

const SOURCE_PACKAGE = '@goorm-dev/vapor-core';
const TARGET_PACKAGE = '@vapor-ui/core';
const COMPONENT_NAME = 'Checkbox';

const transform: Transform = (fileInfo: FileInfo, api: API) => {
    const j = api.jscodeshift;
    const root = j(fileInfo.source);

    // Track the old Checkbox local name from @goorm-dev/vapor-core (e.g., 'Checkbox' or 'CoreCheckbox' if aliased)
    let oldCheckboxLocalName: string | null = null;

    // 1. Import migration: Checkbox -> Checkbox
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
            oldCheckboxLocalName = componentInfo.localName;
        }
    });

    // Merge multiple @vapor-ui/core imports
    mergeImports(root, j, TARGET_PACKAGE);

    // Get the final import name (considering aliases)
    const checkboxImportName = getFinalImportName(root, j, COMPONENT_NAME, TARGET_PACKAGE);

    // 2. Transform Checkbox JSX elements to Checkbox.Root (or alias.Root)
    root.find(j.JSXElement).forEach((path) => {
        const element = path.value;

        // Transform <Checkbox> or <OldCheckboxAlias> to <checkboxImportName.Root>
        // Check if this is the old Checkbox (either 'Checkbox' or its alias from vapor-core)
        if (
            element.openingElement.name.type === 'JSXIdentifier' &&
            (element.openingElement.name.name === 'Checkbox' ||
                (oldCheckboxLocalName && element.openingElement.name.name === oldCheckboxLocalName))
        ) {
            // Change to checkboxImportName.Root
            transformToMemberExpression(j, element, checkboxImportName, 'Root');

            // Transform asChild prop to render prop
            transformAsChildToRender(j, element);
        }
    });

    // 3. Remove Checkbox.Label and replace with TODO comment
    root.find(j.JSXElement).forEach((path) => {
        const element = path.value;

        // Check if this is Checkbox.Label (or alias.Label)
        if (
            element.openingElement.name.type === 'JSXMemberExpression' &&
            element.openingElement.name.object.type === 'JSXIdentifier' &&
            (element.openingElement.name.object.name === 'Checkbox' ||
                (oldCheckboxLocalName &&
                    element.openingElement.name.object.name === oldCheckboxLocalName)) &&
            element.openingElement.name.property.type === 'JSXIdentifier' &&
            element.openingElement.name.property.name === 'Label'
        ) {
            // Find parent element to replace Checkbox.Label
            const parentPath = path.parent;

            if (parentPath && parentPath.value) {
                // Create TODO comment
                const todoComment = j.jsxExpressionContainer(
                    j.jsxEmptyExpression.from({
                        comments: [
                            j.commentLine(
                                ' TODO: Checkbox.Label removed - use standard HTML label element with htmlFor attribute',
                                true,
                                false
                            ),
                        ],
                    })
                );

                // Get children of Checkbox.Label
                const labelChildren = element.children || [];

                // Replace Checkbox.Label element with TODO comment + children
                if (parentPath.value.type === 'JSXElement') {
                    const parentChildren = parentPath.value.children;
                    if (parentChildren) {
                        const labelIndex = parentChildren.indexOf(element);
                        if (labelIndex !== -1) {
                            // Replace Checkbox.Label with TODO comment and its children
                            parentChildren.splice(labelIndex, 1, todoComment, ...labelChildren);
                        }
                    }
                }
            }
        }
    });

    // 4. Transform Checkbox.* elements to use the alias (e.g., Checkbox.Indicator -> checkboxImportName.Indicator)
    // Also handles old aliases (e.g., CoreCheckbox.Indicator -> checkboxImportName.Indicator)
    root.find(j.JSXElement).forEach((path) => {
        const element = path.value;

        // Check if this is Checkbox.* or OldCheckboxAlias.* (e.g., Checkbox.Indicator, CoreCheckbox.Indicator, etc.)
        if (
            element.openingElement.name.type === 'JSXMemberExpression' &&
            element.openingElement.name.object.type === 'JSXIdentifier' &&
            (element.openingElement.name.object.name === 'Checkbox' ||
                (oldCheckboxLocalName &&
                    element.openingElement.name.object.name === oldCheckboxLocalName))
        ) {
            // Replace with the new import name (checkboxImportName)
            element.openingElement.name.object.name = checkboxImportName;

            // Update closing tag if it exists
            if (
                element.closingElement &&
                element.closingElement.name.type === 'JSXMemberExpression' &&
                element.closingElement.name.object.type === 'JSXIdentifier'
            ) {
                element.closingElement.name.object.name = checkboxImportName;
            }
        }
    });

    return root.toSource();
};

export default transform;
export const parser = 'tsx';
