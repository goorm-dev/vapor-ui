import type { API, Collection } from 'jscodeshift';

import {
    getComponentNameFromElement,
    getImportedComponentNames,
} from '../utils/import-verification';

/**
 * Transform `trackAnchor` prop to `disableAnchorTracking` with inverted boolean value.
 *
 * Only transforms components imported from @vapor-ui/core.
 *
 * | Original                  | Transformed                          |
 * |---------------------------|--------------------------------------|
 * | `trackAnchor`             | `disableAnchorTracking={false}`      |
 * | `trackAnchor={true}`      | `disableAnchorTracking={false}`      |
 * | `trackAnchor={false}`     | `disableAnchorTracking={true}`       |
 * | `trackAnchor={expr}`      | `disableAnchorTracking={!expr}`      |
 */
export function transformTrackAnchor(j: API['jscodeshift'], root: Collection): void {
    // Get all components imported from @vapor-ui/core
    const importedComponents = getImportedComponentNames(j, root);

    // Early return if no @vapor-ui/core imports
    if (importedComponents.size === 0) {
        return;
    }

    root.find(j.JSXAttribute, { name: { name: 'trackAnchor' } }).forEach((path) => {
        // Check if the parent JSX element is from @vapor-ui/core
        const parent = path.parent;
        if (!parent || parent.value.type !== 'JSXOpeningElement') {
            return;
        }

        const componentName = getComponentNameFromElement(parent.value.name);

        // Skip if component is not from @vapor-ui/core
        if (!componentName || !importedComponents.has(componentName)) {
            return;
        }

        // Perform transformation
        const attr = path.value;

        // Change prop name to disableAnchorTracking
        attr.name = j.jsxIdentifier('disableAnchorTracking');

        // Handle different value cases
        if (attr.value === null) {
            // Shorthand: trackAnchor → disableAnchorTracking={false}
            attr.value = j.jsxExpressionContainer(j.booleanLiteral(false));
        } else if (attr.value?.type === 'JSXExpressionContainer') {
            const expression = attr.value.expression;

            if (expression.type === 'BooleanLiteral') {
                // trackAnchor={true} → disableAnchorTracking={false}
                // trackAnchor={false} → disableAnchorTracking={true}
                attr.value = j.jsxExpressionContainer(j.booleanLiteral(!expression.value));
            } else if (expression.type === 'JSXEmptyExpression') {
                // trackAnchor={} → disableAnchorTracking={false} (treat as truthy)
                attr.value = j.jsxExpressionContainer(j.booleanLiteral(false));
            } else {
                // trackAnchor={expr} → disableAnchorTracking={!expr}
                attr.value = j.jsxExpressionContainer(j.unaryExpression('!', expression));
            }
        } else if (attr.value?.type === 'StringLiteral') {
            // trackAnchor="true" → disableAnchorTracking={false}
            // trackAnchor="false" → disableAnchorTracking={true}
            const isTruthy = attr.value.value !== 'false';
            attr.value = j.jsxExpressionContainer(j.booleanLiteral(!isTruthy));
        }
    });
}
