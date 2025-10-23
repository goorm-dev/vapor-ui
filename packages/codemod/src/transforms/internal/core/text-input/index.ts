import type {
    API,
    FileInfo,
    ImportDefaultSpecifier,
    ImportNamespaceSpecifier,
    ImportSpecifier,
    JSXElement,
    Transform,
} from 'jscodeshift';

import {
    getFinalImportName,
    mergeImports,
    migrateImportDeclaration,
} from '~/utils/import-migration';

const SOURCE_PACKAGE = '@goorm-dev/vapor-core';
const TARGET_PACKAGE = '@vapor-ui/core';
const OLD_COMPONENT_NAME = 'TextInput';
const NEW_COMPONENT_NAME = 'TextInput';

const transform: Transform = (fileInfo: FileInfo, api: API) => {
    const j = api.jscodeshift;
    const root = j(fileInfo.source);

    let needsFieldImport = false;
    const oldTextInputLocalName: string | null = null;

    // 1. Import migration: TextInput (default) -> { TextInput } (named)
    root.find(j.ImportDeclaration).forEach((path) => {
        migrateImportDeclaration({
            root,
            j,
            path,
            sourcePackage: SOURCE_PACKAGE,
            targetPackage: TARGET_PACKAGE,
            oldComponentName: OLD_COMPONENT_NAME,
            newComponentName: NEW_COMPONENT_NAME,
        });
    });

    // Merge multiple @vapor-ui/core imports
    mergeImports(root, j, TARGET_PACKAGE);

    // Get the final import name (considering aliases)
    const textInputImportName = getFinalImportName(root, j, NEW_COMPONENT_NAME, TARGET_PACKAGE);

    // 2. Transform TextInput JSX elements (Compound pattern -> Single component or Field wrapped)
    root.find(j.JSXElement).forEach((path) => {
        const element = path.value;

        // Check if this is the TextInput root element
        if (
            element.openingElement.name.type === 'JSXIdentifier' &&
            (element.openingElement.name.name === OLD_COMPONENT_NAME ||
                (oldTextInputLocalName &&
                    element.openingElement.name.name === oldTextInputLocalName))
        ) {
            // Find TextInput.Label and TextInput.Field children
            let labelElement: JSXElement | null = null;
            let fieldElement: JSXElement | null = null;
            let hasVisuallyHiddenLabel = false;
            let labelText: string | null = null;
            for (const child of element?.children || []) {
                if (child.type === 'JSXElement') {
                    if (
                        child.openingElement.name.type === 'JSXMemberExpression' &&
                        child.openingElement.name.object.type === 'JSXIdentifier' &&
                        child.openingElement.name.object.name ===
                            (oldTextInputLocalName || OLD_COMPONENT_NAME) &&
                        child.openingElement.name.property.type === 'JSXIdentifier'
                    ) {
                        const propertyName = child.openingElement.name.property.name;

                        if (propertyName === 'Label') {
                            labelElement = child;

                            // Check for visuallyHidden prop
                            const attributes = child.openingElement.attributes || [];
                            hasVisuallyHiddenLabel = attributes.some(
                                (attr) =>
                                    attr.type === 'JSXAttribute' &&
                                    attr.name.type === 'JSXIdentifier' &&
                                    attr.name.name === 'visuallyHidden'
                            );

                            // Extract label text
                            if (child.children && child.children.length > 0) {
                                const firstChild = child.children[0];
                                if (firstChild.type === 'JSXText') {
                                    labelText = firstChild.value.trim();
                                }
                            }
                        } else if (propertyName === 'Field') {
                            fieldElement = child;
                        }
                    }
                }
            }

            if (fieldElement) {
                // Get props from root and field
                const rootProps = element.openingElement.attributes || [];
                const fieldProps = fieldElement.openingElement.attributes || [];

                // Create new TextInput element with merged props
                const newTextInputElement = j.jsxElement(
                    j.jsxOpeningElement(
                        j.jsxIdentifier(textInputImportName),
                        [...rootProps, ...fieldProps],
                        true
                    )
                );

                // Handle label cases
                if (labelElement && !hasVisuallyHiddenLabel && labelText) {
                    // Use Field.Root to wrap
                    needsFieldImport = true;

                    // Create Field.Label with TextInput inside
                    const fieldLabel = j.jsxElement(
                        j.jsxOpeningElement(
                            j.jsxMemberExpression(
                                j.jsxIdentifier('Field'),
                                j.jsxIdentifier('Label')
                            ),
                            []
                        ),
                        j.jsxClosingElement(
                            j.jsxMemberExpression(
                                j.jsxIdentifier('Field'),
                                j.jsxIdentifier('Label')
                            )
                        ),
                        [
                            j.jsxText('\n                ' + labelText + '\n                '),
                            newTextInputElement,
                            j.jsxText('\n            '),
                        ]
                    );

                    // Create Field.Root wrapper
                    const fieldRoot = j.jsxElement(
                        j.jsxOpeningElement(
                            j.jsxMemberExpression(
                                j.jsxIdentifier('Field'),
                                j.jsxIdentifier('Root')
                            ),
                            []
                        ),
                        j.jsxClosingElement(
                            j.jsxMemberExpression(j.jsxIdentifier('Field'), j.jsxIdentifier('Root'))
                        ),
                        [j.jsxText('\n            '), fieldLabel, j.jsxText('\n        ')]
                    );

                    // Replace the entire TextInput with Field.Root
                    j(path).replaceWith(fieldRoot);
                } else if (hasVisuallyHiddenLabel && labelText) {
                    // Add aria-label instead of using Field
                    const ariaLabelAttr = j.jsxAttribute(
                        j.jsxIdentifier('aria-label'),
                        j.stringLiteral(labelText)
                    );

                    newTextInputElement.openingElement.attributes?.unshift(ariaLabelAttr);

                    // Replace the entire TextInput with new TextInput
                    j(path).replaceWith(newTextInputElement);
                } else {
                    // No label, just replace with new TextInput
                    j(path).replaceWith(newTextInputElement);
                }
            }
        }
    });

    // 3. Add Field import if needed
    if (needsFieldImport) {
        const targetImports = root.find(j.ImportDeclaration, {
            source: { value: TARGET_PACKAGE },
        });

        if (targetImports.length > 0) {
            const firstImport = targetImports.at(0).get().value;
            const hasFieldImport = firstImport.specifiers?.some(
                (spec: ImportSpecifier | ImportDefaultSpecifier | ImportNamespaceSpecifier) =>
                    spec.type === 'ImportSpecifier' && spec.imported.name === 'Field'
            );

            if (!hasFieldImport) {
                firstImport.specifiers?.push(j.importSpecifier(j.identifier('Field')));
            }
        }

        // Merge imports again after adding Field
        mergeImports(root, j, TARGET_PACKAGE);
    }

    return root.toSource();
};

export default transform;
export const parser = 'tsx';
