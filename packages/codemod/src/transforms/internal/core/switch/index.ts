import type {
    API,
    FileInfo,
    ImportDefaultSpecifier,
    ImportNamespaceSpecifier,
    ImportSpecifier,
    JSXElement,
    Transform,
} from 'jscodeshift';

import { mergeImports, migrateImportDeclaration } from '~/utils/import-migration';

const SOURCE_PACKAGE = '@goorm-dev/vapor-core';
const TARGET_PACKAGE = '@vapor-ui/core';
const OLD_COMPONENT_NAME = 'Switch';
const NEW_COMPONENT_NAME = 'Switch';

const transform: Transform = (fileInfo: FileInfo, api: API) => {
    const j = api.jscodeshift;
    const root = j(fileInfo.source);

    let needsFieldImport = false;
    const oldSwitchLocalName: string | null = null;

    // 1. Import migration: Switch (default) -> { Switch } (named)
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

    // 2. Transform Switch JSX elements (Compound pattern -> Switch.Root + Field wrapped)
    root.find(j.JSXElement).forEach((path) => {
        const element = path.value;

        // Check if this is the Switch root element
        if (
            element.openingElement.name.type === 'JSXIdentifier' &&
            (element.openingElement.name.name === OLD_COMPONENT_NAME ||
                (oldSwitchLocalName && element.openingElement.name.name === oldSwitchLocalName))
        ) {
            // Find Switch.Label and Switch.Indicator children
            let labelElement: JSXElement | null = null;
            let indicatorElement: JSXElement | null = null;
            let labelText: string | null = null;
            const otherChildren = [];

            for (const child of element?.children || []) {
                if (child.type === 'JSXElement') {
                    if (
                        child.openingElement.name.type === 'JSXMemberExpression' &&
                        child.openingElement.name.object.type === 'JSXIdentifier' &&
                        child.openingElement.name.object.name ===
                            (oldSwitchLocalName || OLD_COMPONENT_NAME) &&
                        child.openingElement.name.property.type === 'JSXIdentifier'
                    ) {
                        const propertyName = child.openingElement.name.property.name;

                        if (propertyName === 'Label') {
                            labelElement = child;

                            // Extract label text
                            if (child.children && child.children.length > 0) {
                                const firstChild = child.children[0];
                                if (firstChild.type === 'JSXText') {
                                    labelText = firstChild.value.trim();
                                }
                            }
                        } else if (propertyName === 'Indicator') {
                            indicatorElement = child;
                        }
                    } else {
                        otherChildren.push(child);
                    }
                } else if (child.type !== 'JSXText' || child.value.trim() !== '') {
                    otherChildren.push(child);
                }
            }

            if (indicatorElement) {
                // Get props from root and indicator
                const rootProps = element.openingElement.attributes || [];
                const indicatorProps = indicatorElement.openingElement.attributes || [];

                // Create Switch.Thumb element
                const thumbElement = j.jsxElement(
                    j.jsxOpeningElement(
                        j.jsxMemberExpression(
                            j.jsxIdentifier(NEW_COMPONENT_NAME),
                            j.jsxIdentifier('Thumb')
                        ),
                        indicatorProps,
                        true
                    )
                );

                // Create new Switch.Root element with merged props
                const newSwitchRootElement = j.jsxElement(
                    j.jsxOpeningElement(
                        j.jsxMemberExpression(
                            j.jsxIdentifier(NEW_COMPONENT_NAME),
                            j.jsxIdentifier('Root')
                        ),
                        rootProps
                    ),
                    j.jsxClosingElement(
                        j.jsxMemberExpression(
                            j.jsxIdentifier(NEW_COMPONENT_NAME),
                            j.jsxIdentifier('Root')
                        )
                    ),
                    [j.jsxText('\n      '), thumbElement, j.jsxText('\n    ')]
                );

                // Handle label cases
                if (labelElement && labelText) {
                    // Use Field.Root to wrap
                    needsFieldImport = true;

                    // Create Field.Label with Switch.Root inside
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
                            j.jsxText('\n      ' + labelText + '\n      '),
                            newSwitchRootElement,
                            j.jsxText('\n    '),
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
                        [j.jsxText('\n    '), fieldLabel, j.jsxText('\n  ')]
                    );

                    // Replace the entire Switch with Field.Root
                    j(path).replaceWith(fieldRoot);
                } else {
                    // No label, just replace with new Switch.Root
                    j(path).replaceWith(newSwitchRootElement);
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
