import type { API, FileInfo, JSXAttribute, JSXElement, Transform } from 'jscodeshift';

import { transformImportDeclaration } from '~/utils/import-transform';
import { transformAsChildToRender, transformToMemberExpression } from '~/utils/jsx-transform';

const SOURCE_PACKAGE = '@goorm-dev/vapor-core';
const TARGET_PACKAGE = '@vapor-ui/core';
const OLD_COMPONENT_NAME = 'Tabs';
const NEW_COMPONENT_NAME = 'Tabs';

const transform: Transform = (fileInfo: FileInfo, api: API) => {
    const j = api.jscodeshift;
    const root = j(fileInfo.source);

    // Track if we need to determine variant from hasBorder
    const hasListWithBorder: Record<string, boolean | null> = {};

    // First pass: analyze Tabs.List to determine hasBorder values
    root.find(j.JSXElement).forEach((path) => {
        const element = path.value;
        if (
            element.openingElement.name.type === 'JSXMemberExpression' &&
            element.openingElement.name.object.type === 'JSXIdentifier' &&
            element.openingElement.name.object.name === OLD_COMPONENT_NAME &&
            element.openingElement.name.property.type === 'JSXIdentifier' &&
            element.openingElement.name.property.name === 'List'
        ) {
            // Find the parent Tabs element
            let parentPath = path.parent;
            let tabsElement: JSXElement | null = null;

            while (parentPath) {
                if (
                    parentPath.value?.type === 'JSXElement' &&
                    ((parentPath.value.openingElement.name.type === 'JSXIdentifier' &&
                        parentPath.value.openingElement.name.name === OLD_COMPONENT_NAME) ||
                        (parentPath.value.openingElement.name.type === 'JSXMemberExpression' &&
                            parentPath.value.openingElement.name.object.type === 'JSXIdentifier' &&
                            parentPath.value.openingElement.name.object.name ===
                                OLD_COMPONENT_NAME &&
                            parentPath.value.openingElement.name.property.type ===
                                'JSXIdentifier' &&
                            parentPath.value.openingElement.name.property.name === 'Root'))
                ) {
                    tabsElement = parentPath.value;
                    break;
                }
                parentPath = parentPath.parent;
            }

            // Extract hasBorder value from Tabs.List
            const hasBorderAttr = element.openingElement.attributes?.find(
                (attr) => attr.type === 'JSXAttribute' && attr.name.name === 'hasBorder',
            ) as JSXAttribute | undefined;

            let hasBorderValue: boolean | null = null;
            if (hasBorderAttr && hasBorderAttr.value) {
                if (hasBorderAttr.value.type === 'JSXExpressionContainer') {
                    const expr = hasBorderAttr.value.expression;
                    if (expr.type === 'BooleanLiteral') {
                        hasBorderValue = expr.value;
                    }
                } else if (hasBorderAttr.value.type === 'Literal') {
                    hasBorderValue = hasBorderAttr.value.value === true;
                }
            } else {
                // Default is true
                hasBorderValue = true;
            }

            // Store for this specific Tabs instance
            if (tabsElement) {
                const key = `${tabsElement.loc?.start.line}:${tabsElement.loc?.start.column}`;
                hasListWithBorder[key] = hasBorderValue;
            }
        }
    });

    // 1. Import migration: Tabs (default) → { Tabs } (named)
    // Custom logic to handle default import → named import conversion
    transformImportDeclaration({
        root,
        j,
        oldComponentName: OLD_COMPONENT_NAME,
        newComponentName: NEW_COMPONENT_NAME,
        sourcePackage: SOURCE_PACKAGE,
        targetPackage: TARGET_PACKAGE,
    });
    // Use component name directly
    const tabsImportName = NEW_COMPONENT_NAME;

    // 2. Transform Tabs root element to Tabs.Root
    root.find(j.JSXElement).forEach((path) => {
        const element: JSXElement = path.value;

        if (
            element.openingElement.name.type === 'JSXIdentifier' &&
            element.openingElement.name.name === OLD_COMPONENT_NAME
        ) {
            const key = `${element.loc?.start.line}:${element.loc?.start.column}`;
            const hasBorder = hasListWithBorder[key];

            // Change prop names: direction → orientation
            const attributes = element.openingElement.attributes || [];
            element.openingElement.attributes = attributes
                .map((attr) => {
                    if (attr.type === 'JSXAttribute') {
                        if (attr.name.name === 'direction') {
                            return j.jsxAttribute(j.jsxIdentifier('orientation'), attr.value);
                        }
                        // Remove stretch, position props
                        if (attr.name.name === 'stretch' || attr.name.name === 'position') {
                            return null;
                        }
                    }
                    return attr;
                })
                .filter((attr): attr is JSXAttribute => attr !== null);

            // Add variant prop based on hasBorder
            if (hasBorder !== null) {
                const variantValue = hasBorder ? 'line' : 'plain';
                element.openingElement.attributes.push(
                    j.jsxAttribute(
                        j.jsxIdentifier('variant'),
                        j.jsxExpressionContainer(j.stringLiteral(variantValue)),
                    ),
                );
            }

            // Transform to Tabs.Root
            transformToMemberExpression(j, element, tabsImportName, 'Root');
            transformAsChildToRender(j, element);
        }
    });

    // 3. Transform Tabs.Button to Tabs.Trigger
    root.find(j.JSXElement).forEach((path) => {
        const element = path.value;

        if (
            element.openingElement.name.type === 'JSXMemberExpression' &&
            element.openingElement.name.object.type === 'JSXIdentifier' &&
            element.openingElement.name.object.name === OLD_COMPONENT_NAME &&
            element.openingElement.name.property.type === 'JSXIdentifier' &&
            element.openingElement.name.property.name === 'Button'
        ) {
            // Remove align prop
            const attributes = element.openingElement.attributes || [];
            element.openingElement.attributes = attributes.filter(
                (attr) => !(attr.type === 'JSXAttribute' && attr.name.name === 'align'),
            );

            // Transform Button → Trigger
            element.openingElement.name.property = j.jsxIdentifier('Trigger');
            if (
                element.closingElement &&
                element.closingElement.name.type === 'JSXMemberExpression'
            ) {
                element.closingElement.name.property = j.jsxIdentifier('Trigger');
            }

            transformAsChildToRender(j, element);
        }
    });

    // 4. Transform Tabs.List to remove hasBorder and loop props, and add Indicator
    root.find(j.JSXElement).forEach((path) => {
        const element = path.value;

        if (
            element.openingElement.name.type === 'JSXMemberExpression' &&
            element.openingElement.name.object.type === 'JSXIdentifier' &&
            element.openingElement.name.object.name === OLD_COMPONENT_NAME &&
            element.openingElement.name.property.type === 'JSXIdentifier' &&
            element.openingElement.name.property.name === 'List'
        ) {
            // Remove hasBorder and loop props
            const attributes = element.openingElement.attributes || [];
            element.openingElement.attributes = attributes.filter(
                (attr) =>
                    !(
                        attr.type === 'JSXAttribute' &&
                        (attr.name.name === 'hasBorder' || attr.name.name === 'loop')
                    ),
            );

            // Add Tabs.Indicator as the last child if not already present
            const children = element.children || [];
            const hasIndicator = children.some(
                (child) =>
                    child.type === 'JSXElement' &&
                    child.openingElement.name.type === 'JSXMemberExpression' &&
                    child.openingElement.name.object.type === 'JSXIdentifier' &&
                    child.openingElement.name.object.name === tabsImportName &&
                    child.openingElement.name.property.type === 'JSXIdentifier' &&
                    child.openingElement.name.property.name === 'Indicator',
            );

            if (!hasIndicator) {
                // Create Tabs.Indicator element
                const indicator = j.jsxElement(
                    j.jsxOpeningElement(
                        j.jsxMemberExpression(
                            j.jsxIdentifier(tabsImportName),
                            j.jsxIdentifier('Indicator'),
                        ),
                        [],
                        true,
                    ),
                );

                // Add indicator as last child
                element.children = [...children, indicator];
            }

            transformAsChildToRender(j, element);
        }
    });

    // 5. Transform Tabs.Panel - remove forceMount and hidden props
    root.find(j.JSXElement).forEach((path) => {
        const element = path.value;

        if (
            element.openingElement.name.type === 'JSXMemberExpression' &&
            element.openingElement.name.object.type === 'JSXIdentifier' &&
            element.openingElement.name.object.name === OLD_COMPONENT_NAME &&
            element.openingElement.name.property.type === 'JSXIdentifier' &&
            element.openingElement.name.property.name === 'Panel'
        ) {
            // Remove forceMount and hidden props
            const attributes = element.openingElement.attributes || [];
            element.openingElement.attributes = attributes.filter(
                (attr) =>
                    !(
                        attr.type === 'JSXAttribute' &&
                        (attr.name.name === 'forceMount' || attr.name.name === 'hidden')
                    ),
            );

            transformAsChildToRender(j, element);
        }
    });

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
