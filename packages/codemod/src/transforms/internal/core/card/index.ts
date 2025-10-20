import type {
    API,
    ASTPath,
    FileInfo,
    ImportDeclaration,
    ImportSpecifier,
    Transform,
} from 'jscodeshift';

const transform: Transform = (fileInfo: FileInfo, api: API) => {
    const j = api.jscodeshift;
    const root = j(fileInfo.source);

    // Track the old Card local name from @goorm-dev/vapor-core (e.g., 'Card' or 'CoreCard' if aliased)
    let oldCardLocalName: string | null = null;

    // 1. Import migration: Card -> Card
    root.find(j.ImportDeclaration).forEach((path) => {
        const importDeclaration = path.value;

        if (
            importDeclaration.source.value &&
            typeof importDeclaration.source.value === 'string' &&
            importDeclaration.source.value === '@goorm-dev/vapor-core'
        ) {
            let hasCard = false;
            const otherSpecifiers: typeof importDeclaration.specifiers = [];

            importDeclaration.specifiers?.forEach((specifier) => {
                if (specifier.type === 'ImportSpecifier' && specifier.imported.name === 'Card') {
                    hasCard = true;
                    // Track the local name (could be aliased)
                    oldCardLocalName = (specifier.local?.name as string) || 'Card';
                } else {
                    otherSpecifiers.push(specifier);
                }
            });

            if (hasCard) {
                // If Card is the only import from @goorm-dev/vapor-core
                if (otherSpecifiers.length === 0) {
                    // Change the entire import to @vapor-ui/core with Card
                    importDeclaration.source.value = '@vapor-ui/core';
                    importDeclaration.specifiers = [j.importSpecifier(j.identifier('Card'))];
                } else {
                    // Remove Card and keep other imports
                    importDeclaration.specifiers = otherSpecifiers;

                    // Add or merge Card into existing @vapor-ui/core imports
                    const vaporImports = root.find(j.ImportDeclaration, {
                        source: { value: '@vapor-ui/core' },
                    });

                    if (vaporImports.length > 0) {
                        // Add Card to existing @vapor-ui/core import
                        const firstImport = vaporImports.at(0).get().value;
                        const hasCard = firstImport.specifiers?.some(
                            (spec: ImportSpecifier) =>
                                spec.type === 'ImportSpecifier' && spec.imported.name === 'Card'
                        );

                        if (!hasCard) {
                            firstImport.specifiers?.push(j.importSpecifier(j.identifier('Card')));
                        }
                    } else {
                        // Create new @vapor-ui/core import with Card
                        const cardImport = j.importDeclaration(
                            [j.importSpecifier(j.identifier('Card'))],
                            j.literal('@vapor-ui/core')
                        );
                        path.insertAfter(cardImport);
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

    // Detect Card import name (including alias)
    let cardImportName: string = 'Card';
    const finalVaporImports = root.find(j.ImportDeclaration, {
        source: { value: '@vapor-ui/core' },
    });

    if (finalVaporImports.length > 0) {
        const vaporImport = finalVaporImports.at(0).get().value;
        vaporImport.specifiers?.forEach((spec: ImportSpecifier) => {
            if (spec.imported.name === 'Card') {
                // Use the local name (alias) if it exists, otherwise use 'Card'
                cardImportName = (spec.local?.name as string) || 'Card';
            }
        });
    }

    // 2. Transform Card JSX elements to Card.Root (or alias.Root)
    root.find(j.JSXElement).forEach((path) => {
        const element = path.value;

        // Transform <Card> or <OldCardAlias> to <cardImportName.Root>
        // Check if this is the old Card (either 'Card' or its alias from vapor-core)
        if (
            element.openingElement.name.type === 'JSXIdentifier' &&
            (element.openingElement.name.name === 'Card' ||
                (oldCardLocalName && element.openingElement.name.name === oldCardLocalName))
        ) {
            // Change to cardImportName.Root
            element.openingElement.name = j.jsxMemberExpression(
                j.jsxIdentifier(cardImportName),
                j.jsxIdentifier('Root')
            );

            // Update closing tag if it exists
            if (element.closingElement) {
                element.closingElement.name = j.jsxMemberExpression(
                    j.jsxIdentifier(cardImportName),
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
            (element.openingElement.name.object.name === 'Card' ||
                (oldCardLocalName && element.openingElement.name.object.name === oldCardLocalName))
        ) {
            // Replace with the new import name (cardImportName)
            element.openingElement.name.object.name = cardImportName;

            // Update closing tag if it exists
            if (
                element.closingElement &&
                element.closingElement.name.type === 'JSXMemberExpression' &&
                element.closingElement.name.object.type === 'JSXIdentifier'
            ) {
                element.closingElement.name.object.name = cardImportName;
            }
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
                                false
                            ),
                        ],
                    })
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

    return root.toSource();
};

export default transform;
export const parser = 'tsx';
