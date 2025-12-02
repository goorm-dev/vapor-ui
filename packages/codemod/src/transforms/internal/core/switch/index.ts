import type { API, FileInfo, ImportSpecifier, JSXElement, Transform } from 'jscodeshift';

import {
    cleanUpSourcePackage,
    collectImportSpecifiersToMove,
    createNewImportDeclaration,
    mergeIntoExistingImport,
} from '~/utils/import-transform';

const SOURCE_PACKAGE = '@goorm-dev/vapor-core';
const TARGET_PACKAGE = '@vapor-ui/core';
const OLD_COMPONENT_NAME = 'Switch';
const NEW_COMPONENT_NAME = 'Switch';

const transform: Transform = (fileInfo: FileInfo, api: API) => {
    const j = api.jscodeshift;
    const root = j(fileInfo.source);

    let needsFieldImport = false;

    const allSpecifiers: ImportSpecifier[] = collectImportSpecifiersToMove(j, root, SOURCE_PACKAGE);
    const specifiersToMove = allSpecifiers.filter(
        (spec) => spec.imported.name === OLD_COMPONENT_NAME,
    );

    if (specifiersToMove.length === 0) {
        return root.toSource();
    }

    const transformedSpecifiers: ImportSpecifier[] = [
        j.importSpecifier(j.identifier(NEW_COMPONENT_NAME)),
    ];
    // 2. Transform Switch JSX elements (Compound pattern -> Switch.Root + Field wrapped)
    root.find(j.JSXElement).forEach((path) => {
        const element = path.value;

        // Check if this is the Switch root element
        if (
            element.openingElement.name.type === 'JSXIdentifier' &&
            element.openingElement.name.name === OLD_COMPONENT_NAME
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

                // Create Switch.ThumbPrimitive element
                const thumbElement = j.jsxElement(
                    j.jsxOpeningElement(
                        j.jsxMemberExpression(
                            j.jsxIdentifier(NEW_COMPONENT_NAME),
                            j.jsxIdentifier('ThumbPrimitive'),
                        ),
                        indicatorProps,
                        true,
                    ),
                );

                // Create new Switch.Root element with merged props
                const newSwitchRootElement = j.jsxElement(
                    j.jsxOpeningElement(
                        j.jsxMemberExpression(
                            j.jsxIdentifier(NEW_COMPONENT_NAME),
                            j.jsxIdentifier('Root'),
                        ),
                        rootProps,
                    ),
                    j.jsxClosingElement(
                        j.jsxMemberExpression(
                            j.jsxIdentifier(NEW_COMPONENT_NAME),
                            j.jsxIdentifier('Root'),
                        ),
                    ),
                    [j.jsxText('\n      '), thumbElement, j.jsxText('\n    ')],
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
                                j.jsxIdentifier('Label'),
                            ),
                            [],
                        ),
                        j.jsxClosingElement(
                            j.jsxMemberExpression(
                                j.jsxIdentifier('Field'),
                                j.jsxIdentifier('Label'),
                            ),
                        ),
                        [
                            j.jsxText('\n      ' + labelText + '\n      '),
                            newSwitchRootElement,
                            j.jsxText('\n    '),
                        ],
                    );

                    // Create Field.Root wrapper
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
                        [j.jsxText('\n    '), fieldLabel, j.jsxText('\n  ')],
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

    const targetImport = root.find(j.ImportDeclaration, {
        source: { value: TARGET_PACKAGE },
    });

    if (targetImport.length > 0) {
        mergeIntoExistingImport(targetImport, transformedSpecifiers);
    } else {
        createNewImportDeclaration(j, root, TARGET_PACKAGE, transformedSpecifiers);
    }

    // 3. Add Field import if needed
    if (needsFieldImport) {
        const existingTargetImport = root.find(j.ImportDeclaration, {
            source: { value: TARGET_PACKAGE },
        });

        if (existingTargetImport.length > 0) {
            const importDecl = existingTargetImport.at(0).get().value;
            const hasField = importDecl.specifiers?.some(
                (spec: ImportSpecifier) =>
                    spec.type === 'ImportSpecifier' && spec.imported.name === 'Field',
            );

            if (!hasField) {
                importDecl.specifiers?.push(j.importSpecifier(j.identifier('Field')));
            }
        }
    }

    cleanUpSourcePackage(j, root, SOURCE_PACKAGE, specifiersToMove);

    return root.toSource();
};

export default transform;
export const parser = 'tsx';
