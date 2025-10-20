import type { API, FileInfo, Transform } from 'jscodeshift';

import {
    getFinalImportName,
    mergeImports,
    migrateImportSpecifier,
} from '~/utils/import-migration';
import {
    transformAsChildToRender,
    transformToMemberExpression,
    updateMemberExpressionObject,
} from '~/utils/jsx-transform';

const SOURCE_PACKAGE = '@goorm-dev/vapor-core';
const TARGET_PACKAGE = '@vapor-ui/core';
const COMPONENT_NAME = 'Collapsible';

const transform: Transform = (fileInfo: FileInfo, api: API) => {
    const j = api.jscodeshift;
    const root = j(fileInfo.source);

    // Track the old Collapsible local name from @goorm-dev/vapor-core
    let oldCollapsibleLocalName: string | null = null;

    // 1. Import migration: Collapsible -> Collapsible
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
            oldCollapsibleLocalName = componentInfo.localName;
        }
    });

    // Merge multiple @vapor-ui/core imports
    mergeImports(root, j, TARGET_PACKAGE);

    // Get the final import name (considering aliases)
    const collapsibleImportName = getFinalImportName(
        root,
        j,
        COMPONENT_NAME,
        TARGET_PACKAGE
    );

    // 2. Transform Collapsible JSX elements to Collapsible.Root
    root.find(j.JSXElement).forEach((path) => {
        const element = path.value;

        // Transform <Collapsible> to <Collapsible.Root>
        if (
            element.openingElement.name.type === 'JSXIdentifier' &&
            (element.openingElement.name.name === 'Collapsible' ||
                (oldCollapsibleLocalName &&
                    element.openingElement.name.name === oldCollapsibleLocalName))
        ) {
            // Change to Collapsible.Root
            transformToMemberExpression(j, element, collapsibleImportName, 'Root');

            // Transform asChild prop to render prop
            transformAsChildToRender(j, element);
        }
    });

    // 3. Transform Collapsible.* elements to use the alias
    // Also handles old aliases (e.g., CoreCollapsible.Trigger -> Collapsible.Trigger)
    root.find(j.JSXElement).forEach((path) => {
        const element = path.value;

        // Check if this is Collapsible.* or OldCollapsibleAlias.*
        if (
            element.openingElement.name.type === 'JSXMemberExpression' &&
            element.openingElement.name.object.type === 'JSXIdentifier' &&
            (element.openingElement.name.object.name === 'Collapsible' ||
                (oldCollapsibleLocalName &&
                    element.openingElement.name.object.name === oldCollapsibleLocalName))
        ) {
            // Get the property name (Trigger, Content, etc.)
            const propertyName =
                element.openingElement.name.property.type === 'JSXIdentifier'
                    ? element.openingElement.name.property.name
                    : null;

            // Replace with the new import name
            updateMemberExpressionObject(element, collapsibleImportName);

            // Transform Content to Panel
            if (propertyName === 'Content') {
                element.openingElement.name.property = j.jsxIdentifier('Panel');
                if (element.closingElement) {
                    element.closingElement.name.property = j.jsxIdentifier('Panel');
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
