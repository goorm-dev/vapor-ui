import type { API, Collection, JSXAttribute } from 'jscodeshift';

import { getLocalComponentNameMap } from '../utils/import-verification';

const COMPONENTS = ['Menu', 'Popover', 'Tooltip'];

// Component-specific props mapping
const COMPONENT_PROPS_MAP: Record<string, string[]> = {
    Menu: ['openOnHover', 'delay', 'closeDelay'],
    Popover: ['openOnHover', 'delay', 'closeDelay'],
    Tooltip: ['delay'], // Tooltip only supports delay
};

/**
 * Transform hover-related props from Root to Trigger component.
 *
 * Only transforms components imported from @vapor-ui/core.
 * Supports aliased imports (e.g., import { Menu as VaporMenu }).
 *
 * Moves hover-related props from Root to Trigger for:
 * - Menu: `openOnHover`, `delay`, `closeDelay`
 * - Popover: `openOnHover`, `delay`, `closeDelay`
 * - Tooltip: `delay` only
 *
 * | Original (Root)                           | Transformed (Trigger)                        |
 * |-------------------------------------------|----------------------------------------------|
 * | `<Menu.Root openOnHover>`                 | `<Menu.Trigger openOnHover>`                 |
 * | `<Popover.Root delay={200}>`              | `<Popover.Trigger delay={200}>`              |
 * | `<Tooltip.Root delay={100}>`              | `<Tooltip.Trigger delay={100}>`              |
 */
export function transformHoverPropsToTrigger(j: API['jscodeshift'], root: Collection): void {
    // Get local names for all target components from @vapor-ui/core
    const componentNameMap = getLocalComponentNameMap(j, root, COMPONENTS);

    // Early return if none of the target components are imported from @vapor-ui/core
    if (componentNameMap.size === 0) {
        return;
    }

    // Iterate over each imported component
    componentNameMap.forEach((localName, originalName) => {
        // Get the props to move for this component
        const propsToMove = COMPONENT_PROPS_MAP[originalName] || [];
        if (propsToMove.length === 0) return;

        // Find Component.Root elements (using local name)
        root.find(j.JSXElement, {
            openingElement: {
                name: {
                    type: 'JSXMemberExpression',
                    object: { name: localName }, // Use local name (respects alias)
                    property: { name: 'Root' },
                },
            },
        }).forEach((rootPath) => {
            const rootElement = rootPath.value;
            const openingElement = rootElement.openingElement;

            // Extract props to move
            const attributesToMove: JSXAttribute[] = [];
            openingElement.attributes = openingElement.attributes?.filter((attr) => {
                if (
                    attr.type === 'JSXAttribute' &&
                    attr.name.type === 'JSXIdentifier' &&
                    propsToMove.includes(attr.name.name)
                ) {
                    attributesToMove.push(attr);
                    return false;
                }
                return true;
            });

            if (attributesToMove.length === 0) return;

            // Find Trigger child and add props (using local name)
            const triggerElements = j(rootPath).find(j.JSXElement, {
                openingElement: {
                    name: {
                        type: 'JSXMemberExpression',
                        object: { name: localName }, // Use local name (respects alias)
                        property: { name: 'Trigger' },
                    },
                },
            });

            triggerElements.forEach((triggerPath) => {
                const triggerOpening = triggerPath.value.openingElement;
                triggerOpening.attributes = [
                    ...(triggerOpening.attributes || []),
                    ...attributesToMove,
                ];
            });
        });
    });
}
