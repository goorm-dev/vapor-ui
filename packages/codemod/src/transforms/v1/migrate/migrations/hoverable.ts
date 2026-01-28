import type { API, Collection } from 'jscodeshift';

import { getLocalComponentName } from '../utils/import-verification';

/**
 * Transform `hoverable` prop to `disableHoverablePopup` with inverted boolean value.
 *
 * This is specific to Tooltip component.
 * Only transforms Tooltip components imported from @vapor-ui/core.
 * Supports aliased imports (e.g., import { Tooltip as MyTooltip }).
 *
 * | Original                  | Transformed                          |
 * |---------------------------|--------------------------------------|
 * | `hoverable`               | `disableHoverablePopup={false}`      |
 * | `hoverable={true}`        | `disableHoverablePopup={false}`      |
 * | `hoverable={false}`       | `disableHoverablePopup={true}`       |
 * | `hoverable={expr}`        | `disableHoverablePopup={!expr}`      |
 */
export function transformHoverable(j: API['jscodeshift'], root: Collection): void {
    // Get the local name for Tooltip from @vapor-ui/core
    const tooltipLocalName = getLocalComponentName(j, root, 'Tooltip');

    // Early return if Tooltip is not imported from @vapor-ui/core
    if (!tooltipLocalName) {
        return;
    }

    // Find Tooltip.Root elements with hoverable prop (using local name)
    root.find(j.JSXElement, {
        openingElement: {
            name: {
                type: 'JSXMemberExpression',
                object: { name: tooltipLocalName }, // Use local name (respects alias)
                property: { name: 'Root' },
            },
        },
    }).forEach((elementPath) => {
        const openingElement = elementPath.value.openingElement;
        const hoverableAttr = openingElement.attributes?.find(
            (attr): attr is typeof attr & { type: 'JSXAttribute' } =>
                attr.type === 'JSXAttribute' &&
                attr.name.type === 'JSXIdentifier' &&
                attr.name.name === 'hoverable',
        );

        if (!hoverableAttr) return;

        const attr = hoverableAttr;

        // Change prop name to disableHoverablePopup
        attr.name = j.jsxIdentifier('disableHoverablePopup');

        // Handle different value cases
        if (attr.value === null) {
            // Shorthand: hoverable → disableHoverablePopup={false}
            attr.value = j.jsxExpressionContainer(j.booleanLiteral(false));
        } else if (attr.value?.type === 'JSXExpressionContainer') {
            const expression = attr.value.expression;

            if (expression.type === 'BooleanLiteral') {
                // hoverable={true} → disableHoverablePopup={false}
                // hoverable={false} → disableHoverablePopup={true}
                attr.value = j.jsxExpressionContainer(j.booleanLiteral(!expression.value));
            } else if (expression.type === 'JSXEmptyExpression') {
                // hoverable={} → disableHoverablePopup={false} (treat as truthy)
                attr.value = j.jsxExpressionContainer(j.booleanLiteral(false));
            } else {
                // hoverable={expr} → disableHoverablePopup={!expr}
                attr.value = j.jsxExpressionContainer(j.unaryExpression('!', expression));
            }
        } else if (attr.value?.type === 'StringLiteral') {
            // hoverable="true" → disableHoverablePopup={false}
            // hoverable="false" → disableHoverablePopup={true}
            const isTruthy = attr.value.value !== 'false';
            attr.value = j.jsxExpressionContainer(j.booleanLiteral(!isTruthy));
        }
    });
}
