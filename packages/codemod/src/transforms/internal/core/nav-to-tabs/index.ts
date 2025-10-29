import type {
    API,
    ASTPath,
    FileInfo,
    ImportSpecifier,
    JSXAttribute,
    JSXElement,
    JSXIdentifier,
    JSXMemberExpression,
    Transform,
} from 'jscodeshift';

import { getFinalImportName, transformImportDeclaration } from '~/utils/import-transform';
import { transformAsChildToRender, transformToMemberExpression } from '~/utils/jsx-transform';

const SOURCE_PACKAGE = '@goorm-dev/vapor-core';
const TARGET_PACKAGE = '@vapor-ui/core';
const OLD_COMPONENT_NAME = 'Nav';
const NEW_COMPONENT_NAME = 'Tabs';

const transform: Transform = (fileInfo: FileInfo, api: API) => {
    const j = api.jscodeshift;
    const root = j(fileInfo.source);

    // Check if Nav import exists (default or named)
    const navImport = root.find(j.ImportDeclaration, {
        source: { value: SOURCE_PACKAGE },
    });

    if (navImport.length === 0) {
        return fileInfo.source;
    }

    const hasNav = navImport
        .at(0)
        .get()
        .value.specifiers?.some(
            (spec: ImportSpecifier) =>
                spec.type === 'ImportSpecifier' && spec.imported.name === OLD_COMPONENT_NAME,
        );

    if (!hasNav) {
        return fileInfo.source;
    }

    // Track which Nav elements should be transformed (pill type only)
    const transformableNavs = new Set<JSXElement>();

    // First, identify which Nav elements are pill (or no type)
    root.find(j.JSXElement).forEach((path) => {
        const element: JSXElement = path.value;

        if (
            element.openingElement.name.type === 'JSXIdentifier' &&
            element.openingElement.name.name === OLD_COMPONENT_NAME
        ) {
            const attributes = element.openingElement.attributes || [];
            const typeProp = attributes.find(
                (attr) =>
                    attr.type === 'JSXAttribute' &&
                    attr.name.type === 'JSXIdentifier' &&
                    attr.name.name === 'type',
            ) as JSXAttribute | undefined;

            // Check if type="pill" or no type prop (default is pill)
            let isPill = true; // Default behavior
            if (typeProp && typeProp.value) {
                if (typeProp.value.type === 'StringLiteral') {
                    isPill = typeProp.value.value === 'pill' || !typeProp.value.value;
                } else if (typeProp.value.type === 'JSXExpressionContainer') {
                    // For expressions, we can't determine at compile time, so skip
                    isPill = false;
                }
            }

            if (isPill) {
                transformableNavs.add(element);
            }
        }
    });

    // If no pill Nav found, don't transform anything
    if (transformableNavs.size === 0) {
        return fileInfo.source;
    }

    // 1. Import migration: Nav → Tabs
    transformImportDeclaration({
        root,
        j,
        oldComponentName: OLD_COMPONENT_NAME,
        newComponentName: NEW_COMPONENT_NAME,
        sourcePackage: SOURCE_PACKAGE,
        targetPackage: TARGET_PACKAGE,
    });

    const tabsImportName = getFinalImportName(root, j, NEW_COMPONENT_NAME, TARGET_PACKAGE);

    // Helper function to check if element is a child of transformable Nav
    function isChildOfTransformableNav(element: JSXElement, path: ASTPath<JSXElement>): boolean {
        let parent = path.parent;
        while (parent) {
            if (parent.value?.type === 'JSXElement') {
                if (transformableNavs.has(parent.value)) {
                    return true;
                }
            }
            parent = parent.parent;
        }
        return false;
    }

    // 2. Transform Nav to Tabs.Root (only transformable Navs)
    root.find(j.JSXElement).forEach((path) => {
        const element: JSXElement = path.value;

        if (
            element.openingElement.name.type === 'JSXIdentifier' &&
            element.openingElement.name.name === OLD_COMPONENT_NAME &&
            transformableNavs.has(element)
        ) {
            const attributes = element.openingElement.attributes || [];

            // Transform props:
            // - direction → orientation
            // - type → remove (replaced with variant="fill")
            // - stretch, position → remove
            element.openingElement.attributes = attributes
                .map((attr) => {
                    if (attr.type === 'JSXAttribute') {
                        if (attr.name.name === 'direction') {
                            return j.jsxAttribute(j.jsxIdentifier('orientation'), attr.value);
                        }
                        // Remove type, stretch, position
                        if (
                            attr.name.name === 'type' ||
                            attr.name.name === 'stretch' ||
                            attr.name.name === 'position'
                        ) {
                            return null;
                        }
                    }
                    return attr;
                })
                .filter((attr): attr is JSXAttribute => attr !== null);

            // Add variant="fill" for pill appearance
            element.openingElement.attributes.push(
                j.jsxAttribute(j.jsxIdentifier('variant'), j.stringLiteral('fill')),
            );

            // Transform to Tabs.Root
            transformToMemberExpression(j, element, tabsImportName, 'Root');
            transformAsChildToRender(j, element);

            // Add comment about migration
            const jsxComment = j.jsxExpressionContainer(j.jsxEmptyExpression());
            jsxComment.expression.comments = [
                j.commentBlock(
                    ' TODO: Nav pill migrated to Tabs fill. Verify behavior and styling. ',
                    true,
                    false,
                ),
            ];

            const parent = path.parent.value;
            if (parent && Array.isArray(parent.children)) {
                const index = parent.children.indexOf(element);
                if (index !== -1) {
                    parent.children.splice(index, 0, jsxComment, j.jsxText('\n            '));
                }
            }
        }
    });

    // 3. Transform Nav.List to Tabs.List and add Tabs.Indicator (only if child of transformable Nav)
    root.find(j.JSXElement).forEach((path) => {
        const element = path.value;

        if (
            element.openingElement.name.type === 'JSXMemberExpression' &&
            element.openingElement.name.object.type === 'JSXIdentifier' &&
            element.openingElement.name.object.name === OLD_COMPONENT_NAME &&
            element.openingElement.name.property.type === 'JSXIdentifier' &&
            element.openingElement.name.property.name === 'List' &&
            isChildOfTransformableNav(element, path)
        ) {
            // Update to Tabs.List
            element.openingElement.name.object.name = tabsImportName;
            if (element.closingElement?.name.type === 'JSXMemberExpression') {
                const closingName = element.closingElement.name as JSXMemberExpression;
                (closingName.object as JSXIdentifier).name = tabsImportName;
            }

            // Add Tabs.Indicator as last child
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
                element.children = [...children, indicator];
            }

            transformAsChildToRender(j, element);
        }
    });

    // 4. Remove Nav.Item wrapper (not needed in Tabs, only if child of transformable Nav)
    root.find(j.JSXElement).forEach((path) => {
        const element = path.value;

        if (
            element.openingElement.name.type === 'JSXMemberExpression' &&
            element.openingElement.name.object.type === 'JSXIdentifier' &&
            element.openingElement.name.object.name === OLD_COMPONENT_NAME &&
            element.openingElement.name.property.type === 'JSXIdentifier' &&
            element.openingElement.name.property.name === 'Item' &&
            isChildOfTransformableNav(element, path)
        ) {
            // Remove Nav.Item by replacing it with its children
            const parent = path.parent;
            if (parent && parent.value && Array.isArray(parent.value.children)) {
                const index = parent.value.children.indexOf(element);
                if (index !== -1) {
                    // Replace Nav.Item with its children
                    parent.value.children.splice(index, 1, ...(element.children || []));
                }
            }
        }
    });

    // 5. Transform Nav.Link to Tabs.Trigger (only if child of transformable Nav)
    root.find(j.JSXElement).forEach((path) => {
        const element = path.value;

        if (
            element.openingElement.name.type === 'JSXMemberExpression' &&
            element.openingElement.name.object.type === 'JSXIdentifier' &&
            element.openingElement.name.object.name === OLD_COMPONENT_NAME &&
            element.openingElement.name.property.type === 'JSXIdentifier' &&
            element.openingElement.name.property.name === 'Link' &&
            isChildOfTransformableNav(element, path)
        ) {
            const attributes = element.openingElement.attributes || [];

            // Transform active → selected, align → remove
            element.openingElement.attributes = attributes
                .map((attr) => {
                    if (attr.type === 'JSXAttribute') {
                        if (attr.name.name === 'active') {
                            return j.jsxAttribute(j.jsxIdentifier('selected'), attr.value);
                        }
                        // Remove align, href (Tabs use value not href)
                        if (attr.name.name === 'align' || attr.name.name === 'href') {
                            return null;
                        }
                    }
                    return attr;
                })
                .filter((attr): attr is JSXAttribute => attr !== null);

            // Update to Tabs.Trigger
            element.openingElement.name.object.name = tabsImportName;
            element.openingElement.name.property = j.jsxIdentifier('Trigger');
            if (element.closingElement?.name.type === 'JSXMemberExpression') {
                const closingName = element.closingElement.name as JSXMemberExpression;
                (closingName.object as JSXIdentifier).name = tabsImportName;
                closingName.property = j.jsxIdentifier('Trigger');
            }

            transformAsChildToRender(j, element);

            // Add comment about removed href
            const jsxComment = j.jsxExpressionContainer(j.jsxEmptyExpression());
            jsxComment.expression.comments = [
                j.commentBlock(
                    ' TODO: href prop removed. Use value prop for tabs. Add Tabs.Panel for content. ',
                    true,
                    false,
                ),
            ];

            const parent = path.parent.value;
            if (parent && Array.isArray(parent.children)) {
                const index = parent.children.indexOf(element);
                if (index !== -1) {
                    parent.children.splice(
                        index,
                        0,
                        jsxComment,
                        j.jsxText('\n                    '),
                    );
                }
            }
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
