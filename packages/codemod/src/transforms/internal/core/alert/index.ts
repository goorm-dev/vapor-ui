import type { API, FileInfo, ImportSpecifier, Transform } from 'jscodeshift';

import type { ComponentRenameRule } from '~/utils/import-transform';
import {
    buildAliasMap,
    cleanUpSourcePackage,
    collectImportSpecifiersToMove,
    createNewImportDeclaration,
    filterSpecifiersByMap,
    mergeIntoExistingImport,
    transformSpecifier,
} from '~/utils/import-transform';
import { transformAsChildToRender, transformToMemberExpression } from '~/utils/jsx-transform';

const SOURCE_PACKAGE = '@goorm-dev/vapor-core';
const TARGET_PACKAGE = '@vapor-ui/core';

const COMPONENT_RENAME_MAP: {
    [oldName: string]: ComponentRenameRule;
} = {
    Alert: {
        newImport: 'Callout',
        newJSX: 'Callout.Root',
    },
};

const transform: Transform = (fileInfo: FileInfo, api: API) => {
    const j = api.jscodeshift;
    const root = j(fileInfo.source);

    const allSpecifiers: ImportSpecifier[] = collectImportSpecifiersToMove(j, root, SOURCE_PACKAGE);

    // Filter only Alert-related specifiers
    const specifiersToMove = filterSpecifiersByMap(allSpecifiers, COMPONENT_RENAME_MAP);

    if (specifiersToMove.length === 0) {
        return root.toSource();
    }

    // Get the Alert's local name before transformation
    const alertLocalName =
        specifiersToMove.find((spec) => spec.imported.name === 'Alert')?.local?.name || 'Alert';

    const transformedSpecifiers = transformSpecifier(j, specifiersToMove, COMPONENT_RENAME_MAP);
    const calloutLocalName = buildAliasMap(transformedSpecifiers).get('Callout') || 'Callout';

    // Transform Alert JSX elements BEFORE import changes
    root.find(j.JSXElement).forEach((path) => {
        const element = path.value;

        // Find Alert elements (using original local name)
        if (
            element.openingElement.name.type === 'JSXIdentifier' &&
            element.openingElement.name.name === alertLocalName
        ) {
            // Transform asChild prop to render prop FIRST
            transformAsChildToRender(j, element);

            // Check if first JSX element child is an icon and wrap it with Callout.Icon
            if (element.children && element.children.length > 0) {
                let firstElementIndex = -1;
                let firstElement = null;

                for (let i = 0; i < element.children.length; i++) {
                    const child = element.children[i];
                    if (child.type === 'JSXElement') {
                        firstElementIndex = i;
                        firstElement = child;
                        break;
                    }
                }

                // Check if first element is an icon component
                if (
                    firstElement &&
                    firstElement.openingElement.name.type === 'JSXIdentifier' &&
                    (firstElement.openingElement.name.name.endsWith('Icon') ||
                        firstElement.openingElement.name.name === 'svg')
                ) {
                    // Wrap icon with Callout.Icon
                    const iconWrapper = j.jsxElement(
                        j.jsxOpeningElement(
                            j.jsxMemberExpression(
                                j.jsxIdentifier(calloutLocalName as string),
                                j.jsxIdentifier('Icon'),
                            ),
                            [],
                        ),
                        j.jsxClosingElement(
                            j.jsxMemberExpression(
                                j.jsxIdentifier(calloutLocalName as string),
                                j.jsxIdentifier('Icon'),
                            ),
                        ),
                        [firstElement],
                    );

                    // Replace first element with wrapped icon
                    element.children[firstElementIndex] = iconWrapper;
                }
            }

            // Change Alert to Callout.Root
            transformToMemberExpression(j, element, calloutLocalName as string, 'Root');
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
