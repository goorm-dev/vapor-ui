import type { API, JSXElement } from 'jscodeshift';

/**
 * Transform asChild prop to render prop
 * @param j - jscodeshift API
 * @param element - JSX element to transform
 * @returns true if transformation was applied
 */
export function transformAsChildToRender(j: API['jscodeshift'], element: JSXElement): boolean {
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

        for (let i = 0; i < element.children.length; i++) {
            const child = element.children[i];
            if (child.type === 'JSXElement') {
                firstElement = child;
                break;
            }
        }

        if (firstElement) {
            // Create render prop with the first element including its children
            const renderProp = j.jsxAttribute(
                j.jsxIdentifier('render'),
                j.jsxExpressionContainer(firstElement)
            );

            element.openingElement.attributes = [renderProp, ...element.openingElement.attributes];

            // Make the parent element self-closing
            element.openingElement.selfClosing = true;
            element.closingElement = null;
            element.children = [];

            return true;
        }
    }

    return false;
}

/**
 * Transform component name from simple identifier to member expression
 * @param j - jscodeshift API
 * @param element - JSX element to transform
 * @param objectName - Object name (e.g., 'Card')
 * @param propertyName - Property name (e.g., 'Root')
 */
export function transformToMemberExpression(
    j: API['jscodeshift'],
    element: JSXElement,
    objectName: string,
    propertyName: string
): void {
    element.openingElement.name = j.jsxMemberExpression(
        j.jsxIdentifier(objectName),
        j.jsxIdentifier(propertyName)
    );

    if (element.closingElement) {
        element.closingElement.name = j.jsxMemberExpression(
            j.jsxIdentifier(objectName),
            j.jsxIdentifier(propertyName)
        );
    }
}

/**
 * Update member expression object name (e.g., Card.Body -> NewCard.Body)
 * @param element - JSX element to transform
 * @param newObjectName - New object name
 */
export function updateMemberExpressionObject(element: JSXElement, newObjectName: string): void {
    if (
        element.openingElement.name.type === 'JSXMemberExpression' &&
        element.openingElement.name.object.type === 'JSXIdentifier'
    ) {
        element.openingElement.name.object.name = newObjectName;

        if (
            element.closingElement &&
            element.closingElement.name.type === 'JSXMemberExpression' &&
            element.closingElement.name.object.type === 'JSXIdentifier'
        ) {
            element.closingElement.name.object.name = newObjectName;
        }
    }
}

/**
 * Transform forceMount prop to keepMounted prop
 * @param j - jscodeshift API
 * @param element - JSX element to transform
 * @returns true if transformation was applied
 */
export function transformForceMountToKeepMounted(
    j: API['jscodeshift'],
    element: JSXElement
): boolean {
    const attributes = element.openingElement.attributes || [];
    let transformed = false;

    element.openingElement.attributes = attributes.map((attr) => {
        if (attr.type === 'JSXAttribute' && attr.name.name === 'forceMount') {
            transformed = true;
            return j.jsxAttribute(j.jsxIdentifier('keepMounted'), attr.value);
        }
        return attr;
    });

    return transformed;
}
