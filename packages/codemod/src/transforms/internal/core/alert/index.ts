import type {
    API,
    FileInfo,
    Transform,
    ImportSpecifier,
    ASTPath,
    ImportDeclaration,
} from 'jscodeshift';

const transform: Transform = (fileInfo: FileInfo, api: API) => {
    const j = api.jscodeshift;
    const root = j(fileInfo.source);

    // 1. Import migration: Alert -> Callout
    root.find(j.ImportDeclaration).forEach((path) => {
        const importDeclaration = path.value;

        if (
            importDeclaration.source.value &&
            typeof importDeclaration.source.value === 'string' &&
            importDeclaration.source.value === '@goorm-dev/vapor-core'
        ) {
            let hasAlert = false;
            const otherSpecifiers: typeof importDeclaration.specifiers = [];

            importDeclaration.specifiers?.forEach((specifier) => {
                if (specifier.type === 'ImportSpecifier' && specifier.imported.name === 'Alert') {
                    hasAlert = true;
                } else {
                    otherSpecifiers.push(specifier);
                }
            });

            if (hasAlert) {
                // If Alert is the only import from @goorm-dev/vapor-core
                if (otherSpecifiers.length === 0) {
                    // Change the entire import to @vapor-ui/core with Callout
                    importDeclaration.source.value = '@vapor-ui/core';
                    importDeclaration.specifiers = [j.importSpecifier(j.identifier('Callout'))];
                } else {
                    // Remove Alert and keep other imports
                    importDeclaration.specifiers = otherSpecifiers;

                    // Add or merge Callout into existing @vapor-ui/core imports
                    const vaporImports = root.find(j.ImportDeclaration, {
                        source: { value: '@vapor-ui/core' },
                    });

                    if (vaporImports.length > 0) {
                        // Add Callout to existing @vapor-ui/core import
                        const firstImport = vaporImports.at(0).get().value;
                        const hasCallout = firstImport.specifiers?.some(
                            (spec: ImportSpecifier) =>
                                spec.type === 'ImportSpecifier' && spec.imported.name === 'Callout'
                        );

                        if (!hasCallout) {
                            firstImport.specifiers?.push(
                                j.importSpecifier(j.identifier('Callout'))
                            );
                        }
                    } else {
                        // Create new @vapor-ui/core import with Callout
                        const calloutImport = j.importDeclaration(
                            [j.importSpecifier(j.identifier('Callout'))],
                            j.literal('@vapor-ui/core')
                        );
                        path.insertAfter(calloutImport);
                    }
                }
            }
        }
    });

    // Merge multiple @vapor-ui/core imports
    const vaporImports = root.find(j.ImportDeclaration, {
        source: { value: '@vapor-ui/core' },
    });

    if (vaporImports.length > 1) {
        const allSpecifiers: ImportSpecifier[] = [];
        vaporImports.forEach((path: ASTPath<ImportDeclaration>) => {
            path.value.specifiers?.forEach((spec) => {
                if (spec.type === 'ImportSpecifier') {
                    const exists = allSpecifiers.some(
                        (s) => s.imported.name === spec.imported.name
                    );
                    if (!exists) {
                        allSpecifiers.push(spec);
                    }
                }
            });
        });

        const firstImport = vaporImports.at(0).get();
        firstImport.value.specifiers = allSpecifiers;

        vaporImports.forEach((path, idx) => {
            if (idx > 0) {
                j(path).remove();
            }
        });
    }

    // 2. Transform Alert JSX elements to Callout.Root
    root.find(j.JSXElement).forEach((path) => {
        const element = path.value;

        // Transform <Alert> to <Callout.Root>
        if (
            element.openingElement.name.type === 'JSXIdentifier' &&
            element.openingElement.name.name === 'Alert'
        ) {
            // Change Alert to Callout.Root
            element.openingElement.name = j.jsxMemberExpression(
                j.jsxIdentifier('Callout'),
                j.jsxIdentifier('Root')
            );

            // Update closing tag if it exists
            if (element.closingElement) {
                element.closingElement.name = j.jsxMemberExpression(
                    j.jsxIdentifier('Callout'),
                    j.jsxIdentifier('Root')
                );
            }

            // Transform asChild prop to render prop
            const attributes = element.openingElement.attributes || [];
            let hasAsChild = false;
            const newAttributes = attributes.filter((attr) => {
                if (attr.type === 'JSXAttribute' && attr.name.name === 'asChild') {
                    hasAsChild = true;
                    return false; // Remove asChild prop
                }
                return true;
            });

            element.openingElement.attributes = newAttributes;

            // If asChild was present, add render prop with first child element
            if (hasAsChild && element.children && element.children.length > 0) {
                // Find the first JSXElement child
                let firstElement = null;
                let firstElementIndex = -1;

                for (let i = 0; i < element.children.length; i++) {
                    const child = element.children[i];
                    if (child.type === 'JSXElement') {
                        firstElement = child;
                        firstElementIndex = i;
                        break;
                    }
                }

                if (firstElement) {
                    // Create render prop with the first element (self-closing version)
                    const renderProp = j.jsxAttribute(
                        j.jsxIdentifier('render'),
                        j.jsxExpressionContainer(
                            j.jsxElement(
                                j.jsxOpeningElement(
                                    firstElement.openingElement.name,
                                    firstElement.openingElement.attributes || [],
                                    true // self-closing
                                ),
                                null,
                                []
                            )
                        )
                    );

                    element.openingElement.attributes = [
                        renderProp,
                        ...element.openingElement.attributes,
                    ];

                    // Extract children from the wrapper element and replace the wrapper with its children
                    const wrapperChildren = firstElement.children || [];
                    const beforeWrapper = element.children.slice(0, firstElementIndex);
                    const afterWrapper = element.children.slice(firstElementIndex + 1);
                    element.children = [...beforeWrapper, ...wrapperChildren, ...afterWrapper];
                }
            }

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
                                j.jsxIdentifier('Callout'),
                                j.jsxIdentifier('Icon')
                            ),
                            []
                        ),
                        j.jsxClosingElement(
                            j.jsxMemberExpression(
                                j.jsxIdentifier('Callout'),
                                j.jsxIdentifier('Icon')
                            )
                        ),
                        [firstElement]
                    );

                    // Replace first element with wrapped icon
                    element.children[firstElementIndex] = iconWrapper;
                }
            }

            // All props (color, className, etc.) remain unchanged
            // No prop transformation needed
        }
    });

    return root.toSource();
};

export default transform;
export const parser = 'tsx';
