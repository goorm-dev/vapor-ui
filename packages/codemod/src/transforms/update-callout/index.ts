import type { API, FileInfo, Transform } from 'jscodeshift';

const transform: Transform = (fileInfo: FileInfo, api: API) => {
    const j = api.jscodeshift;
    const root = j(fileInfo.source);

    // Find all Alert import declarations and update them to Callout
    root.find(j.ImportDeclaration).forEach((path) => {
        const importDeclaration = path.value;

        // Check if this import is from @goorm-dev/vapor-core or @vapor-ui/core and imports Alert
        if (
            importDeclaration.source.value &&
            typeof importDeclaration.source.value === 'string' &&
            (importDeclaration.source.value === '@goorm-dev/vapor-core' ||
                importDeclaration.source.value === '@vapor-ui/core')
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

            // If Alert was imported from @goorm-dev/vapor-core
            if (hasAlert && importDeclaration.source.value === '@goorm-dev/vapor-core') {
                // Keep other imports from @goorm-dev/vapor-core
                if (otherSpecifiers.length > 0) {
                    importDeclaration.specifiers = otherSpecifiers;
                } else {
                    // Remove the entire import if only Alert was imported
                    j(path).remove();
                }
            } else if (hasAlert && importDeclaration.source.value === '@vapor-ui/core') {
                // Just rename Alert to Callout in existing @vapor-ui/core import
                importDeclaration.specifiers?.forEach((specifier) => {
                    if (specifier.type === 'ImportSpecifier' && specifier.imported.name === 'Alert') {
                        specifier.imported.name = 'Callout';
                        if (specifier.local) {
                            specifier.local.name = 'Callout';
                        }
                    }
                });
            }
        }
    });

    // Add Callout import from @vapor-ui/core if it was removed from @goorm-dev/vapor-core
    const hasCalloutImport = root
        .find(j.ImportDeclaration, {
            source: { value: '@vapor-ui/core' },
        })
        .filter((path) => {
            return (
                path.value.specifiers?.some(
                    (spec) => spec.type === 'ImportSpecifier' && spec.imported.name === 'Callout'
                ) || false
            );
        })
        .length > 0;

    if (!hasCalloutImport) {
        const calloutImport = j.importDeclaration(
            [j.importSpecifier(j.identifier('Callout'))],
            j.literal('@vapor-ui/core')
        );

        // Insert after the last import or at the beginning
        const lastImport = root.find(j.ImportDeclaration).at(-1);
        if (lastImport.length > 0) {
            lastImport.insertAfter(calloutImport);
        } else {
            root.find(j.Program).get('body', 0).insertBefore(calloutImport);
        }
    }

    // Find JSX elements with Alert tag and transform them to Callout
    root.find(j.JSXElement).forEach((path) => {
        const element = path.value;

        // Check if this is an Alert element
        if (
            element.openingElement.name.type === 'JSXIdentifier' &&
            element.openingElement.name.name === 'Alert'
        ) {
            // Change Alert to Callout.Root
            element.openingElement.name = j.jsxMemberExpression(
                j.jsxIdentifier('Callout'),
                j.jsxIdentifier('Root')
            );

            if (element.closingElement) {
                element.closingElement.name = j.jsxMemberExpression(
                    j.jsxIdentifier('Callout'),
                    j.jsxIdentifier('Root')
                );
            }

            // Check if this Alert has asChild prop
            let hasAsChildProp = false;
            let asChildAttr = null;

            element.openingElement.attributes?.forEach((attr) => {
                if (attr.type === 'JSXAttribute' && attr.name.name === 'asChild') {
                    hasAsChildProp = true;
                    asChildAttr = attr;
                }
            });

            if (hasAsChildProp && asChildAttr) {
                // For asChild case, convert to render prop with children as JSX expression
                const children = element.children;

                if (children && children.length > 0) {
                    // Find the first JSX element child (the custom wrapper)
                    const jsxChild = children.find((child) => child.type === 'JSXElement');

                    if (jsxChild) {
                        // Remove asChild attribute and add render prop with the JSX child
                        element.openingElement.attributes =
                            element.openingElement.attributes?.filter(
                                (attr) =>
                                    !(attr.type === 'JSXAttribute' && attr.name.name === 'asChild')
                            );

                        // Add render prop with JSX expression container
                        const renderProp = j.jsxAttribute(
                            j.jsxIdentifier('render'),
                            j.jsxExpressionContainer(jsxChild)
                        );

                        element.openingElement.attributes?.push(renderProp);

                        // Make it self-closing and remove children
                        element.openingElement.selfClosing = true;
                        element.closingElement = null;
                        element.children = [];
                    }
                }
            } else {
                // Normal Alert case - transform children structure
                const children = element.children;
                if (children && children.length > 0) {
                    const newChildren: (typeof children)[number][] = [];
                    const textContent: (typeof children)[number][] = [];

                    // Separate icon and text content
                    children.forEach((child) => {
                        if (
                            child.type === 'JSXElement' &&
                            child.openingElement.name.type === 'JSXIdentifier' &&
                            child.openingElement.name.name.endsWith('Icon')
                        ) {
                            // This is an icon element
                            const iconElement = j.jsxElement(
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
                                [child]
                            );
                            newChildren.push(iconElement);
                        } else if (child.type === 'JSXText' && child.value.trim() !== '') {
                            textContent.push(child);
                        } else if (
                            child.type === 'JSXExpressionContainer' ||
                            (child.type === 'JSXElement' &&
                                !(
                                    child.openingElement.name.type === 'JSXIdentifier' &&
                                    child.openingElement.name.name.endsWith('Icon')
                                ))
                        ) {
                            textContent.push(child);
                        }
                    });

                    // Add text content directly to Callout.Root
                    newChildren.push(...textContent);

                    element.children = newChildren;
                }
            }
        }
    });

    return root.toSource({});
};

export default transform;
export const parset = 'tsx';
