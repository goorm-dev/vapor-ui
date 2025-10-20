import type {
    API,
    FileInfo,
    Transform,
    JSXAttribute,
    JSXSpreadAttribute,
} from 'jscodeshift';
import { getFinalImportName, mergeImports, migrateImportSpecifier } from '~/utils/import-migration';
import { transformToMemberExpression } from '~/utils/jsx-transform';

const SOURCE_PACKAGE = '@goorm-dev/vapor-core';
const TARGET_PACKAGE = '@vapor-ui/core';
const COMPONENT_NAME = 'Avatar';

const transform: Transform = (fileInfo: FileInfo, api: API) => {
    const j = api.jscodeshift;
    const root = j(fileInfo.source);

    // Track the old Avatar local name
    let oldAvatarLocalName: string | null = null;

    // 1. Import migration
    root.find(j.ImportDeclaration).forEach((path) => {
        const componentInfo = migrateImportSpecifier(
            root,
            j,
            path,
            COMPONENT_NAME,
            SOURCE_PACKAGE,
            TARGET_PACKAGE
        );

        if (componentInfo) {
            oldAvatarLocalName = componentInfo.localName;
        }
    });

    // Merge multiple @vapor-ui/core imports
    mergeImports(root, j, TARGET_PACKAGE);

    // Get the final import name
    const avatarImportName = getFinalImportName(root, j, COMPONENT_NAME, TARGET_PACKAGE);

    // 2. Transform Avatar JSX elements
    root.find(j.JSXElement).forEach((path) => {
        const element = path.value;

        // Transform <Avatar> to <Avatar.Simple>
        if (
            element.openingElement.name.type === 'JSXIdentifier' &&
            (element.openingElement.name.name === 'Avatar' ||
                (oldAvatarLocalName && element.openingElement.name.name === oldAvatarLocalName))
        ) {
            // Change Avatar to Avatar.Simple
            transformToMemberExpression(j, element, avatarImportName, 'Simple');

            const attributes = element.openingElement.attributes || [];
            let hasSquareProp = false;
            let hasSrcInChildren = false;
            let srcValue: JSXAttribute['value'] = null;

            // Check for Avatar.Image children and extract src
            element.children?.forEach((child) => {
                if (
                    child.type === 'JSXElement' &&
                    child.openingElement.name.type === 'JSXMemberExpression' &&
                    child.openingElement.name.object.type === 'JSXIdentifier' &&
                    child.openingElement.name.object.name === 'Avatar' &&
                    child.openingElement.name.property.name === 'Image'
                ) {
                    hasSrcInChildren = true;
                    // Extract src prop from Avatar.Image
                    child.openingElement.attributes?.forEach((attr) => {
                        if (attr.type === 'JSXAttribute' && attr.name.name === 'src') {
                            srcValue = attr.value;
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
                                j.stringLiteral('square')
                            );
                        } else if (attr.value.type === 'StringLiteral') {
                            // square="true" or square="false"
                            const boolValue = attr.value.value === 'true';
                            shapeAttr = j.jsxAttribute(
                                j.jsxIdentifier('shape'),
                                j.stringLiteral(boolValue ? 'square' : 'circle')
                            );
                        } else if (attr.value.type === 'JSXExpressionContainer') {
                            const expr = attr.value.expression;

                            // square={true} or square={false}
                            if (expr.type === 'BooleanLiteral') {
                                shapeAttr = j.jsxAttribute(
                                    j.jsxIdentifier('shape'),
                                    j.stringLiteral(expr.value ? 'square' : 'circle')
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
                                            j.stringLiteral('circle')
                                        )
                                    )
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
                                    j.stringLiteral('circle')
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

            if (altAttr) {
                newAttributes.push(altAttr);
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
                        child.openingElement.name.object.name === 'Avatar' &&
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

    return root.toSource();
};

export default transform;
export const parser = 'tsx';
