import type { API, Collection } from 'jscodeshift';

import {
    getComponentNameFromElement,
    getImportedComponentNames,
} from '../utils/import-verification';

/**
 * Transform `selected` prop to `current` on NavigationMenu.Link.
 *
 * Only transforms components imported from @vapor-ui/core.
 * This change aligns with the Breadcrumb API for consistency.
 *
 * | Original           | Transformed         |
 * |--------------------|---------------------|
 * | `selected`         | `current`           |
 * | `selected={true}`  | `current={true}`    |
 * | `selected={false}` | `current={false}`   |
 * | `selected={expr}`  | `current={expr}`    |
 */
export function transformSelectedToCurrent(j: API['jscodeshift'], root: Collection): void {
    // Get all components imported from @vapor-ui/core
    const importedComponents = getImportedComponentNames(j, root);

    // Early return if no @vapor-ui/core imports
    if (importedComponents.size === 0) {
        return;
    }

    root.find(j.JSXAttribute, { name: { name: 'selected' } }).forEach((path) => {
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

        // Only transform NavigationMenu.Link
        if (componentName !== 'NavigationMenu') {
            return;
        }

        // Verify it's NavigationMenu.Link specifically
        const elementName = parent.value.name;
        if (
            elementName.type === 'JSXMemberExpression' &&
            elementName.property.type === 'JSXIdentifier' &&
            elementName.property.name === 'Link'
        ) {
            // Perform transformation
            const attr = path.value;
            attr.name = j.jsxIdentifier('current');
        }
    });
}
