import type {
    API,
    ASTPath,
    FileInfo,
    ImportDefaultSpecifier,
    ImportNamespaceSpecifier,
    ImportSpecifier,
    JSXAttribute,
    JSXElement,
    Transform,
} from 'jscodeshift';

import { hasComponentInPackage, transformImportDeclaration } from '~/utils/import-transform';
import { transformAsChildToRender, transformToMemberExpression } from '~/utils/jsx-transform';

const SOURCE_PACKAGE = '@goorm-dev/vapor-core';
const TARGET_PACKAGE = '@vapor-ui/core';
const OLD_COMPONENT_NAME = 'RadioGroup';
const NEW_COMPONENT_NAME = 'RadioGroup';
const RADIO_COMPONENT_NAME = 'Radio';
const FIELD_COMPONENT_NAME = 'Field';

const transform: Transform = (fileInfo: FileInfo, api: API) => {
    const j = api.jscodeshift;
    const root = j(fileInfo.source);

    let hasLabels = false;

    // Check if any RadioGroup has Labels to determine if we need Field import
    root.find(j.JSXElement).forEach((path) => {
        const element = path.value;
        if (
            element.openingElement.name.type === 'JSXMemberExpression' &&
            element.openingElement.name.object.type === 'JSXIdentifier' &&
            element.openingElement.name.object.name === OLD_COMPONENT_NAME &&
            element.openingElement.name.property.type === 'JSXIdentifier' &&
            element.openingElement.name.property.name === 'Label'
        ) {
            hasLabels = true;
        }
    });

    if (!hasComponentInPackage(root, j, OLD_COMPONENT_NAME, SOURCE_PACKAGE)) {
        return fileInfo.source;
    }

    // 1. Import migration
    transformImportDeclaration({
        root,
        j,
        oldComponentName: OLD_COMPONENT_NAME,
        newComponentName: NEW_COMPONENT_NAME,
        sourcePackage: SOURCE_PACKAGE,
        targetPackage: TARGET_PACKAGE,
    });

    // 2. Add Radio and Field imports
    const targetImports = root.find(j.ImportDeclaration, { source: { value: TARGET_PACKAGE } });

    if (targetImports.length > 0) {
        const firstImport = targetImports.at(0).get().value;

        // Add Radio import
        const hasRadio = firstImport.specifiers?.some(
            (spec: ImportSpecifier | ImportDefaultSpecifier | ImportNamespaceSpecifier) =>
                spec.type === 'ImportSpecifier' && spec.imported.name === RADIO_COMPONENT_NAME,
        );

        if (!hasRadio) {
            firstImport.specifiers?.push(j.importSpecifier(j.identifier(RADIO_COMPONENT_NAME)));
        }

        // Add Field import if labels exist
        if (hasLabels) {
            const hasField = firstImport.specifiers?.some(
                (spec: ImportSpecifier | ImportDefaultSpecifier | ImportNamespaceSpecifier) =>
                    spec.type === 'ImportSpecifier' && spec.imported.name === FIELD_COMPONENT_NAME,
            );

            if (!hasField) {
                firstImport.specifiers?.push(j.importSpecifier(j.identifier(FIELD_COMPONENT_NAME)));
            }
        }
    }

    // Merge imports again after adding Radio and Field

    // Use component names directly
    const radioGroupImportName = NEW_COMPONENT_NAME;
    const radioImportName = RADIO_COMPONENT_NAME;
    const fieldImportName = hasLabels ? FIELD_COMPONENT_NAME : null;

    // 3. Transform RadioGroup root element to RadioGroup.Root
    root.find(j.JSXElement).forEach((path) => {
        const element: JSXElement = path.value;

        if (
            element.openingElement.name.type === 'JSXIdentifier' &&
            element.openingElement.name.name === OLD_COMPONENT_NAME
        ) {
            // Change prop names: selectedValue → value, defaultSelectedValue → defaultValue,
            // onSelectedValueChange → onValueChange, direction → orientation
            const attributes = element.openingElement.attributes || [];
            element.openingElement.attributes = attributes.map((attr) => {
                if (attr.type === 'JSXAttribute') {
                    if (attr.name.name === 'selectedValue') {
                        return j.jsxAttribute(j.jsxIdentifier('value'), attr.value);
                    } else if (attr.name.name === 'defaultSelectedValue') {
                        return j.jsxAttribute(j.jsxIdentifier('defaultValue'), attr.value);
                    } else if (attr.name.name === 'onSelectedValueChange') {
                        return j.jsxAttribute(j.jsxIdentifier('onValueChange'), attr.value);
                    } else if (attr.name.name === 'direction') {
                        return j.jsxAttribute(j.jsxIdentifier('orientation'), attr.value);
                    }
                }
                return attr;
            });

            // Transform to RadioGroup.Root
            transformToMemberExpression(j, element, radioGroupImportName, 'Root');
            transformAsChildToRender(j, element);
        }
    });

    // 4. Process RadioGroup.Item elements
    // Store items to be removed after processing their children
    const itemsToRemove: Array<{
        path: ASTPath<JSXElement>;
        children: JSXElement['children'];
        attributes: JSXElement['attributes'];
    }> = [];

    root.find(j.JSXElement).forEach((path) => {
        const element = path.value;

        if (
            element.openingElement.name.type === 'JSXMemberExpression' &&
            element.openingElement.name.object.type === 'JSXIdentifier' &&
            element.openingElement.name.object.name === OLD_COMPONENT_NAME &&
            element.openingElement.name.property.type === 'JSXIdentifier' &&
            element.openingElement.name.property.name === 'Item'
        ) {
            // Extract disabled prop from Item
            const disabledAttr = element.openingElement.attributes?.find(
                (attr) => attr.type === 'JSXAttribute' && attr.name.name === 'disabled',
            );

            // Store Item's attributes for later (to preserve key, className, etc.)
            const itemAttributes = element.openingElement.attributes || [];

            // Store for later processing
            itemsToRemove.push({
                path,
                children: element.children || [],
                attributes: itemAttributes,
            });

            // Pass disabled prop to Radio.Root (Indicator)
            if (disabledAttr && element.children) {
                element.children.forEach((child) => {
                    if (
                        child.type === 'JSXElement' &&
                        child.openingElement.name.type === 'JSXMemberExpression' &&
                        child.openingElement.name.property.type === 'JSXIdentifier' &&
                        child.openingElement.name.property.name === 'Indicator'
                    ) {
                        if (!child.openingElement.attributes) {
                            child.openingElement.attributes = [];
                        }
                        // Only add if not already present
                        const hasDisabled = child.openingElement.attributes.some(
                            (attr) => attr.type === 'JSXAttribute' && attr.name.name === 'disabled',
                        );
                        if (!hasDisabled) {
                            child.openingElement.attributes.push(disabledAttr as JSXAttribute);
                        }
                    }
                });
            }
        }
    });

    // 5. Transform RadioGroup.Indicator to Radio.Root and RadioGroup.Label to Field.Label
    root.find(j.JSXElement).forEach((path) => {
        const element = path.value;

        if (
            element.openingElement.name.type === 'JSXMemberExpression' &&
            element.openingElement.name.object.type === 'JSXIdentifier' &&
            element.openingElement.name.object.name === OLD_COMPONENT_NAME
        ) {
            const propertyName =
                element.openingElement.name.property.type === 'JSXIdentifier'
                    ? element.openingElement.name.property.name
                    : null;

            if (propertyName === 'Indicator') {
                // Transform RadioGroup.Indicator to Radio.Root
                element.openingElement.name.object = j.jsxIdentifier(radioImportName);
                element.openingElement.name.property = j.jsxIdentifier('Root');
                if (
                    element.closingElement &&
                    element.closingElement.name.type === 'JSXMemberExpression'
                ) {
                    element.closingElement.name.object = j.jsxIdentifier(radioImportName);
                    element.closingElement.name.property = j.jsxIdentifier('Root');
                }

                transformAsChildToRender(j, element);
            } else if (propertyName === 'Label' && fieldImportName) {
                // Transform RadioGroup.Label to Field.Label
                element.openingElement.name.object = j.jsxIdentifier(fieldImportName);
                element.openingElement.name.property = j.jsxIdentifier('Label');
                if (
                    element.closingElement &&
                    element.closingElement.name.type === 'JSXMemberExpression'
                ) {
                    element.closingElement.name.object = j.jsxIdentifier(fieldImportName);
                    element.closingElement.name.property = j.jsxIdentifier('Label');
                }

                transformAsChildToRender(j, element);
            }
        }
    });

    // 6. Remove RadioGroup.Item elements and hoist their children
    itemsToRemove.forEach(({ path, children, attributes }) => {
        if (!children) return;
        // Group children: find Indicator and Label
        let indicator = null;
        let label = null;
        const otherChildren: JSXElement['children'] = [];

        for (const child of children) {
            if (child.type === 'JSXElement') {
                if (
                    child.openingElement.name.type === 'JSXMemberExpression' &&
                    child.openingElement.name.property.type === 'JSXIdentifier'
                ) {
                    const propName = child.openingElement.name.property.name;
                    if (
                        propName === 'Root' &&
                        child.openingElement.name.object.type === 'JSXIdentifier' &&
                        child.openingElement.name.object.name === radioImportName
                    ) {
                        indicator = child;
                    } else if (
                        propName === 'Label' &&
                        fieldImportName &&
                        child.openingElement.name.object.type === 'JSXIdentifier' &&
                        child.openingElement.name.object.name === fieldImportName
                    ) {
                        label = child;
                    } else {
                        otherChildren.push(child);
                    }
                } else {
                    // Regular JSX elements (like <div>, <span>, etc.) should be preserved
                    otherChildren.push(child);
                }
            } else if (child.type === 'JSXText' && child.value.trim()) {
                otherChildren.push(child);
            } else if (child.type === 'JSXExpressionContainer') {
                otherChildren.push(child);
            }
        }

        // If both indicator and label exist, restructure: Field.Label wraps Radio.Root + label text
        if (indicator && label) {
            // Create new Field.Label structure: <Field.Label><Radio.Root />{label children}</Field.Label>
            const labelChildren = label.children || [];
            const newLabelChildren = [indicator, ...labelChildren];

            // Filter out disabled attribute from Item (it's handled in Radio.Root)
            // but keep other attributes like key, className, etc.
            const itemAttrsToKeep = attributes?.filter(
                (attr) => attr.type === 'JSXAttribute' && attr.name.name !== 'disabled',
            );

            // Merge Item's attributes with Label's attributes (Item attrs take precedence)
            const mergedAttributes = [
                ...(itemAttrsToKeep || []),
                ...(label.openingElement.attributes || []),
            ];

            const newLabel = j.jsxElement(
                j.jsxOpeningElement(
                    j.jsxMemberExpression(
                        j.jsxIdentifier(fieldImportName!),
                        j.jsxIdentifier('Label'),
                    ),
                    mergedAttributes,
                ),
                j.jsxClosingElement(
                    j.jsxMemberExpression(
                        j.jsxIdentifier(fieldImportName!),
                        j.jsxIdentifier('Label'),
                    ),
                ),
                newLabelChildren,
            );

            // Replace Item with the new structure
            j(path).replaceWith([newLabel, ...otherChildren]);
        } else if (indicator) {
            // Only indicator, no label
            // Transfer Item's attributes to Radio.Root (except disabled which is already handled)
            const itemAttrsToKeep =
                attributes?.filter(
                    (attr) => attr.type === 'JSXAttribute' && attr.name.name !== 'disabled',
                ) || [];
            if (itemAttrsToKeep.length > 0) {
                indicator.openingElement.attributes = [
                    ...itemAttrsToKeep,
                    ...(indicator.openingElement.attributes || []),
                ];
            }
            j(path).replaceWith([indicator, ...otherChildren]);
        } else if (label) {
            // Only label, no indicator (rare case)
            // Transfer Item's attributes to Field.Label
            const itemAttrsToKeep =
                attributes?.filter(
                    (attr) => attr.type === 'JSXAttribute' && attr.name.name !== 'disabled',
                ) || [];
            if (itemAttrsToKeep.length > 0) {
                label.openingElement.attributes = [
                    ...itemAttrsToKeep,
                    ...(label.openingElement.attributes || []),
                ];
            }
            j(path).replaceWith([label, ...otherChildren]);
        } else {
            // No indicator or label, just hoist other children
            j(path).replaceWith(otherChildren);
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
