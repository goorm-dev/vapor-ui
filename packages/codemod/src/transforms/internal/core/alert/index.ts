import type { API, FileInfo, Transform } from 'jscodeshift';

import {
    getFinalImportName,
    hasComponentInPackage,
    transformImportDeclaration,
} from '~/utils/import-transform';
import { transformAsChildToRender, transformToMemberExpression } from '~/utils/jsx-transform';

const SOURCE_PACKAGE = '@goorm-dev/vapor-core';
const TARGET_PACKAGE = '@vapor-ui/core';
const OLD_COMPONENT_NAME = 'Alert';
const NEW_COMPONENT_NAME = 'Callout';

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

    // Get the final import name for Callout
    const calloutImportName = getFinalImportName(root, j, NEW_COMPONENT_NAME, TARGET_PACKAGE);

    // 2. Transform Alert JSX elements to Callout.Root
    root.find(j.JSXElement).forEach((path) => {
        const element = path.value;

        // Transform <Alert> to <Callout.Root>
        if (
            element.openingElement.name.type === 'JSXIdentifier' &&
            element.openingElement.name.name === 'Alert'
        ) {
            // Change to Callout.Root
            transformToMemberExpression(j, element, calloutImportName, 'Root');

            // Transform asChild prop to render prop
            transformAsChildToRender(j, element);

            // Check if first JSX element child is an icon and wrap it with Callout.Icon
            if (element.children && element.children.length > 0) {
                // Find the first JSXElement child (skip whitespace/text)
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
                                j.jsxIdentifier(calloutImportName),
                                j.jsxIdentifier('Icon'),
                            ),
                            [],
                        ),
                        j.jsxClosingElement(
                            j.jsxMemberExpression(
                                j.jsxIdentifier(calloutImportName),
                                j.jsxIdentifier('Icon'),
                            ),
                        ),
                        [firstElement],
                    );

                    // Replace first element with wrapped icon
                    element.children[firstElementIndex] = iconWrapper;
                }
            }

            // All props (color, className, etc.) remain unchanged
            // No prop transformation needed
        }
    });

    const printOptions = {
        quote: 'single' as const,
        objectCurlySpacing: true,
        reuseWhitespace: true,
        lineTerminator: '\n',
        tabwidth: 4,
    };

    return root.toSource(printOptions);
};

export default transform;
export const parser = 'tsx';
