import { type API, FileInfo, Transform } from 'jscodeshift';

const transform: Transform = (fileInfo: FileInfo, api: API) => {
    const j = api.jscodeshift;
    const root = j(fileInfo.source);

    // Find all Alert import declarations and update them to Callout
    root.find(j.ImportDeclaration).forEach((path) => {
        const importDeclaration = path.value;

        // Check if this import is from a vapor-ui package and imports Alert
        if (
            importDeclaration.source.value &&
            typeof importDeclaration.source.value === 'string' &&
            importDeclaration.source.value.includes('@vapor-ui')
        ) {
            importDeclaration.specifiers?.forEach((specifier) => {
                if (specifier.type === 'ImportSpecifier' && specifier.imported.name === 'Alert') {
                    specifier.imported.name = 'Callout';
                    if (specifier.local) {
                        specifier.local.name = 'Callout';
                    }
                }
            });
        }
    });

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
                j.jsxIdentifier('Root'),
            );

            if (element.closingElement) {
                element.closingElement.name = j.jsxMemberExpression(
                    j.jsxIdentifier('Callout'),
                    j.jsxIdentifier('Root'),
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
                                    !(attr.type === 'JSXAttribute' && attr.name.name === 'asChild'),
                            );

                        // Add render prop with JSX expression container
                        const renderProp = j.jsxAttribute(
                            j.jsxIdentifier('render'),
                            j.jsxExpressionContainer(jsxChild),
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
                    const newChildren = [];
                    let textContent: any[] = [];

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
                                        j.jsxIdentifier('Icon'),
                                    ),
                                    [],
                                ),
                                j.jsxClosingElement(
                                    j.jsxMemberExpression(
                                        j.jsxIdentifier('Callout'),
                                        j.jsxIdentifier('Icon'),
                                    ),
                                ),
                                [child],
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

    // Handle self-closing Alert elements
    root.find(j.JSXOpeningElement).forEach((path) => {
        const openingElement = path.value;

        if (
            openingElement.name.type === 'JSXIdentifier' &&
            openingElement.name.name === 'Alert' &&
            openingElement.selfClosing
        ) {
            openingElement.name = j.jsxMemberExpression(
                j.jsxIdentifier('Callout'),
                j.jsxIdentifier('Root'),
            );

            // Handle asChild prop -> render prop (for self-closing elements, keep as boolean)
            openingElement.attributes?.forEach((attr) => {
                if (attr.type === 'JSXAttribute' && attr.name.name === 'asChild') {
                    attr.name.name = 'render';
                }
            });
        }
    });

    return root.toSource({});
};

export default transform;
export const parset = 'tsx';
