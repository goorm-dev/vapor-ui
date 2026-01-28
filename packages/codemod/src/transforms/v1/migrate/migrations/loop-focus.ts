import type { API, Collection } from 'jscodeshift';

import {
    getComponentNameFromElement,
    getImportedComponentNames,
} from '../utils/import-verification';

/**
 * Transform `loop` prop to `loopFocus`.
 *
 * Only transforms components imported from @vapor-ui/core.
 *
 * | Original        | Transformed        |
 * |-----------------|--------------------|
 * | `loop`          | `loopFocus`        |
 * | `loop={true}`   | `loopFocus={true}` |
 * | `loop={false}`  | `loopFocus={false}`|
 * | `loop={expr}`   | `loopFocus={expr}` |
 */
export function transformLoop(j: API['jscodeshift'], root: Collection): void {
    // Get all components imported from @vapor-ui/core
    const importedComponents = getImportedComponentNames(j, root);

    // Early return if no @vapor-ui/core imports
    if (importedComponents.size === 0) {
        return;
    }

    root.find(j.JSXAttribute, { name: { name: 'loop' } }).forEach((path) => {
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
        attr.name = j.jsxIdentifier('loopFocus');
    });
}
