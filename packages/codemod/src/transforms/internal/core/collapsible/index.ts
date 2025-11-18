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

    const specifiersToMove = allSpecifiers.filter((spec) => spec.imported.name === 'Collapsible');

    if (specifiersToMove.length === 0) {
        return root.toSource();
    }

    const oldCollapsibleImportName =
        specifiersToMove.find((spec) => spec.imported.name === 'Collapsible')?.local?.name ||
        'Collapsible';

    const transformedSpecifiers = transformSpecifier(j, specifiersToMove, {});

    const collapsibleImportName = oldCollapsibleImportName as string;

    // 2. Transform Collapsible JSX elements to Collapsible.Root
    root.find(j.JSXElement).forEach((path) => {
        const element = path.value;

        // Transform <Collapsible> to <Collapsible.Root>
        if (
            element.openingElement.name.type === 'JSXIdentifier' &&
            element.openingElement.name.name === oldCollapsibleImportName
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
            element.openingElement.name.object.name === oldCollapsibleImportName
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
                if (
                    element.closingElement &&
                    element.closingElement.name.type === 'JSXMemberExpression'
                ) {
                    element.closingElement.name.property = j.jsxIdentifier('Panel');
                }
            }

            // Transform forceMount prop to keepMounted for Panel
            if (propertyName === 'Content' || propertyName === 'Panel') {
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
