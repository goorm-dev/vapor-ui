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
    hasComponentInPackage,
    transformImportDeclaration,
} from '~/utils/import-transform';

const SOURCE_PACKAGE = '@goorm-dev/vapor-core';
const TARGET_PACKAGE = '@vapor-ui/core';
const OLD_COMPONENT_NAME = 'TextInput';
const NEW_COMPONENT_NAME = 'TextInput';

const transform: Transform = (fileInfo: FileInfo, api: API) => {
    const j = api.jscodeshift;
    const root = j(fileInfo.source);

    let needsFieldImport = false;

    // 1. Check if TextInput exists in source package
    if (!hasComponentInPackage(root, j, OLD_COMPONENT_NAME, SOURCE_PACKAGE)) {
        return fileInfo.source;
    }

    // Get the local import name from source package (before transformation)
    const sourceTextInputName = root
        .find(j.ImportDeclaration, { source: { value: SOURCE_PACKAGE } })
        .find(j.ImportSpecifier, { imported: { name: OLD_COMPONENT_NAME } })
        .at(0);

    const localTextInputName =
        sourceTextInputName.length > 0
            ? sourceTextInputName.get().value.local?.name || OLD_COMPONENT_NAME
            : OLD_COMPONENT_NAME;

    // 2. Import migration: TextInput -> TextInput
    transformImportDeclaration({
        root,
        j,
        oldComponentName: OLD_COMPONENT_NAME,
        newComponentName: NEW_COMPONENT_NAME,
        sourcePackage: SOURCE_PACKAGE,
        targetPackage: TARGET_PACKAGE,
    });

    // Get the final import name (considering aliases)
    const textInputImportName = getFinalImportName(root, j, NEW_COMPONENT_NAME, TARGET_PACKAGE);

    // 3. Transform TextInput JSX elements (Compound pattern -> Single component or Field wrapped)
    root.find(j.JSXElement).forEach((path) => {
        const element = path.value;

        // Check if this is the TextInput root element
        if (
            element.openingElement.name.type === 'JSXIdentifier' &&
            element.openingElement.name.name === localTextInputName
        ) {
            // Find TextInput.Label and TextInput.Field children (recursively)
            let labelElement: JSXElement | null = null;
            let fieldElement: JSXElement | null = null;
            let fieldParentElement: JSXElement | null = null;
            let hasVisuallyHiddenLabel = false;
            let labelText: string | null = null;

            type ChildNode = JSXElement['children'][number];

            const findFieldRecursively = (
                children: ChildNode[],
            ): { field: JSXElement | null; parent: JSXElement | null } => {
                for (const child of children) {
                    if (child.type === 'JSXElement') {
                        if (
                            child.openingElement.name.type === 'JSXMemberExpression' &&
                            child.openingElement.name.object.type === 'JSXIdentifier' &&
                            child.openingElement.name.object.name === localTextInputName &&
                            child.openingElement.name.property.type === 'JSXIdentifier' &&
                            child.openingElement.name.property.name === 'Field'
                        ) {
                            return { field: child, parent: null };
                        }
                        // Recurse into children
                        if (child.children) {
                            const result = findFieldRecursively(child.children);
                            if (result.field) {
                                return { field: result.field, parent: result.parent || child };
                            }
                        }
                    }
                }
                return { field: null, parent: null };
            };

            for (const child of element?.children || []) {
                if (child.type === 'JSXElement') {
                    if (
                        child.openingElement.name.type === 'JSXMemberExpression' &&
                        child.openingElement.name.object.type === 'JSXIdentifier' &&
                        child.openingElement.name.object.name === localTextInputName &&
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
                                    attr.name.name === 'visuallyHidden',
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

            // If Field not found as direct child, search recursively
            if (!fieldElement) {
                const result = findFieldRecursively(element.children || []);
                fieldElement = result.field;
                fieldParentElement = result.parent;
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
                        true,
                    ),
                );

                // Handle label cases
                if (labelElement && !hasVisuallyHiddenLabel) {
                    // Use Field.Root to wrap
                    needsFieldImport = true;

                    // Preserve Label's attributes (className, etc.)
                    const labelAttributes = labelElement.openingElement.attributes || [];

                    // Get Label's children and add TextInput
                    const labelChildren = [...(labelElement.children || [])];
                    labelChildren.push(newTextInputElement);

                    // Create Field.Label with preserved children and TextInput
                    const fieldLabel = j.jsxElement(
                        j.jsxOpeningElement(
                            j.jsxMemberExpression(
                                j.jsxIdentifier('Field'),
                                j.jsxIdentifier('Label'),
                            ),
                            labelAttributes,
                        ),
                        j.jsxClosingElement(
                            j.jsxMemberExpression(
                                j.jsxIdentifier('Field'),
                                j.jsxIdentifier('Label'),
                            ),
                        ),
                        labelChildren,
                    );

                    // Collect other children from Field's parent or TextInput root
                    let otherChildren = [];
                    if (fieldParentElement && fieldParentElement.children) {
                        // Extract children from Field's parent container (excluding the Field itself)
                        otherChildren = fieldParentElement.children.filter(
                            (child) =>
                                child !== fieldElement &&
                                (child.type !== 'JSXText' || child.value.trim() !== ''),
                        );
                    } else {
                        // Field was a direct child, collect other direct children
                        otherChildren =
                            element.children?.filter(
                                (child) =>
                                    child !== labelElement &&
                                    child !== fieldElement &&
                                    (child.type !== 'JSXText' || child.value.trim() !== ''),
                            ) || [];
                    }

                    // Create Field.Root wrapper with Label and other children
                    const fieldRootChildren = [fieldLabel, ...otherChildren];

                    const fieldRoot = j.jsxElement(
                        j.jsxOpeningElement(
                            j.jsxMemberExpression(
                                j.jsxIdentifier('Field'),
                                j.jsxIdentifier('Root'),
                            ),
                            [],
                        ),
                        j.jsxClosingElement(
                            j.jsxMemberExpression(
                                j.jsxIdentifier('Field'),
                                j.jsxIdentifier('Root'),
                            ),
                        ),
                        fieldRootChildren,
                    );

                    // Replace the entire TextInput with Field.Root
                    j(path).replaceWith(fieldRoot);
                } else if (hasVisuallyHiddenLabel && labelText) {
                    // Add aria-label instead of using Field
                    const ariaLabelAttr = j.jsxAttribute(
                        j.jsxIdentifier('aria-label'),
                        j.stringLiteral(labelText),
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
                    spec.type === 'ImportSpecifier' && spec.imported.name === 'Field',
            );

            if (!hasFieldImport) {
                firstImport.specifiers?.push(j.importSpecifier(j.identifier('Field')));
            }
        }
    }

    const printOptions = {
        quote: 'auto' as const,
        trailingComma: true,
        tabWidth: 4,
        reuseWhitespace: true,
    };

    return root.toSource(printOptions);
};

export default transform;
export const parser = 'tsx';
