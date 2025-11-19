import type {
    API,
    FileInfo,
    ImportSpecifier,
    JSXAttribute,
    JSXSpreadAttribute,
    Transform,
} from 'jscodeshift';

import {
    cleanUpSourcePackage,
    collectImportSpecifiersToMove,
    createNewImportDeclaration,
    mergeIntoExistingImport,
    transformSpecifier,
} from '~/utils/import-transform';
import { transformToMemberExpression } from '~/utils/jsx-transform';

const SOURCE_PACKAGE = '@goorm-dev/vapor-core';
const TARGET_PACKAGE = '@vapor-ui/core';

const transform: Transform = (fileInfo: FileInfo, api: API) => {
    const j = api.jscodeshift;
    const root = j(fileInfo.source);

    const allSpecifiers: ImportSpecifier[] = collectImportSpecifiersToMove(j, root, SOURCE_PACKAGE);

    const specifiersToMove = allSpecifiers.filter((spec) => spec.imported.name === 'Avatar');

    if (specifiersToMove.length === 0) {
        return root.toSource();
    }

    const avatarImportName =
        specifiersToMove.find((spec) => spec.imported.name === 'Avatar')?.local?.name || 'Avatar';

    const transformedSpecifiers = transformSpecifier(j, specifiersToMove, {});

    // 2. Transform Avatar JSX elements
    root.find(j.JSXElement).forEach((path) => {
        const element = path.value;

        // Transform <Avatar> to <Avatar.Simple>
        if (
            element.openingElement.name.type === 'JSXIdentifier' &&
            element.openingElement.name.name === avatarImportName
        ) {
            // Change Avatar to Avatar.Root
            transformToMemberExpression(j, element, avatarImportName, 'Root');

            const attributes = element.openingElement.attributes || [];
            let hasSquareProp = false;
            let hasSrcInChildren = false;
            let srcValue: JSXAttribute['value'] = null;
            let altValue: JSXAttribute['value'] = null;

            // Check for Avatar.Image children and extract src/alt
            element.children?.forEach((child) => {
                if (
                    child.type === 'JSXElement' &&
                    child.openingElement.name.type === 'JSXMemberExpression' &&
                    child.openingElement.name.object.type === 'JSXIdentifier' &&
                    child.openingElement.name.object.name === avatarImportName &&
                    child.openingElement.name.property.name === 'Image'
                ) {
                    hasSrcInChildren = true;
                    // Extract src and alt props from Avatar.Image
                    child.openingElement.attributes?.forEach((attr) => {
                        if (attr.type === 'JSXAttribute') {
                            if (attr.name.name === 'src') {
                                srcValue = attr.value;
                            } else if (attr.name.name === 'alt') {
                                altValue = attr.value;
                            }
                        }
                    });
                }
            });

            // Collect and transform props
            let altAttr: JSXAttribute | null = null;
            let shapeAttr: JSXAttribute | null = null;
            const otherAttrs: (JSXAttribute | JSXSpreadAttribute)[] = [];

            attributes.forEach((attr) => {
                if (attr.type === 'JSXAttribute') {
                    // Change label to alt
                    if (attr.name.name === 'label') {
                        attr.name.name = 'alt';
                        altAttr = attr;
                    }
                    // Handle square prop
                    else if (attr.name.name === 'square') {
                        hasSquareProp = true;

                        // Transform square to shape
                        if (!attr.value) {
                            // square (no value, means true)
                            shapeAttr = j.jsxAttribute(
                                j.jsxIdentifier('shape'),
                                j.stringLiteral('square'),
                            );
                        } else if (attr.value.type === 'StringLiteral') {
                            // square="true" or square="false"
                            const boolValue = attr.value.value === 'true';
                            shapeAttr = j.jsxAttribute(
                                j.jsxIdentifier('shape'),
                                j.stringLiteral(boolValue ? 'square' : 'circle'),
                            );
                        } else if (attr.value.type === 'JSXExpressionContainer') {
                            const expr = attr.value.expression;

                            // square={true} or square={false}
                            if (expr.type === 'BooleanLiteral') {
                                shapeAttr = j.jsxAttribute(
                                    j.jsxIdentifier('shape'),
                                    j.stringLiteral(expr.value ? 'square' : 'circle'),
                                );
                            }
                            // square={expression} - convert to ternary (but not JSXEmptyExpression)
                            else if (expr.type !== 'JSXEmptyExpression') {
                                shapeAttr = j.jsxAttribute(
                                    j.jsxIdentifier('shape'),
                                    j.jsxExpressionContainer(
                                        j.conditionalExpression(
                                            expr,
                                            j.stringLiteral('square'),
                                            j.stringLiteral('circle'),
                                        ),
                                    ),
                                );
                            }
                            // square={} - treat as false (default to circle)
                            // Note: This path is unreachable in practice since square={} is invalid JSX syntax.
                            // It's kept as defensive code for manually constructed AST nodes.
                            /* istanbul ignore next */
                            else {
                                /* istanbul ignore next */
                                shapeAttr = j.jsxAttribute(
                                    j.jsxIdentifier('shape'),
                                    j.stringLiteral('circle'),
                                );
                            }
                        }
                    } else {
                        otherAttrs.push(attr);
                    }
                } else {
                    otherAttrs.push(attr);
                }
            });

            // If no square prop was present, add shape="circle" (old default was false)
            if (!hasSquareProp) {
                shapeAttr = j.jsxAttribute(j.jsxIdentifier('shape'), j.stringLiteral('circle'));
            }

            // Build attributes in desired order: alt, other props, shape, src
            const newAttributes: (JSXAttribute | JSXSpreadAttribute)[] = [];

            // Use alt from Avatar.Image if label doesn't exist on parent
            if (altAttr) {
                newAttributes.push(altAttr);
            } else if (altValue) {
                newAttributes.push(j.jsxAttribute(j.jsxIdentifier('alt'), altValue));
            }

            newAttributes.push(...otherAttrs);

            if (shapeAttr) {
                newAttributes.push(shapeAttr);
            }

            // If Avatar.Image children exist and has src, move src to parent
            if (hasSrcInChildren && srcValue) {
                newAttributes.push(j.jsxAttribute(j.jsxIdentifier('src'), srcValue));
            }

            element.openingElement.attributes = newAttributes;

            // Remove Avatar.Image children if they exist
            if (hasSrcInChildren) {
                const filteredChildren = element.children?.filter((child) => {
                    if (
                        child.type === 'JSXElement' &&
                        child.openingElement.name.type === 'JSXMemberExpression' &&
                        child.openingElement.name.object.type === 'JSXIdentifier' &&
                        child.openingElement.name.object.name === avatarImportName &&
                        child.openingElement.name.property.name === 'Image'
                    ) {
                        return false;
                    }
                    // Also filter out whitespace-only text nodes
                    if (child.type === 'JSXText' && !child.value.trim()) {
                        return false;
                    }
                    return true;
                });

                element.children = filteredChildren;

                // If no meaningful children remain, convert to self-closing tag
                const hasContent = filteredChildren?.some((child) => {
                    if (child.type === 'JSXText') {
                        return child.value.trim().length > 0;
                    }
                    return child.type === 'JSXElement' || child.type === 'JSXExpressionContainer';
                });

                if (!hasContent) {
                    element.openingElement.selfClosing = true;
                    element.closingElement = null;
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

    cleanUpSourcePackage(j, root, SOURCE_PACKAGE, specifiersToMove);

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
