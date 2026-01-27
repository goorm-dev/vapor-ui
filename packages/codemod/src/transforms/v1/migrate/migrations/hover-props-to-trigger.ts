import type { API, Collection, JSXAttribute } from 'jscodeshift';

const COMPONENTS = ['Menu', 'Popover', 'Tooltip'];
const PROPS_TO_MOVE = ['openOnHover', 'delay', 'closeDelay'];

/**
 * Transform hover-related props from Root to Trigger component.
 *
 * Moves `openOnHover`, `delay`, `closeDelay` props from Root to Trigger for:
 * - Menu
 * - Popover
 * - Tooltip (only `delay` and `closeDelay`, as `openOnHover` is not applicable)
 *
 * | Original (Root)                           | Transformed (Trigger)                        |
 * |-------------------------------------------|----------------------------------------------|
 * | `<Menu.Root openOnHover>`                 | `<Menu.Trigger openOnHover>`                 |
 * | `<Popover.Root delay={200}>`              | `<Popover.Trigger delay={200}>`              |
 * | `<Tooltip.Root closeDelay={100}>`         | `<Tooltip.Trigger closeDelay={100}>`         |
 */
export function transformHoverPropsToTrigger(j: API['jscodeshift'], root: Collection): void {
    COMPONENTS.forEach((component) => {
        // Find Component.Root elements
        root.find(j.JSXElement, {
            openingElement: {
                name: {
                    type: 'JSXMemberExpression',
                    object: { name: component },
                    property: { name: 'Root' },
                },
            },
        }).forEach((rootPath) => {
            const rootElement = rootPath.value;
            const openingElement = rootElement.openingElement;

            // Extract props to move
            const propsToMove: JSXAttribute[] = [];
            openingElement.attributes = openingElement.attributes?.filter((attr) => {
                if (
                    attr.type === 'JSXAttribute' &&
                    attr.name.type === 'JSXIdentifier' &&
                    PROPS_TO_MOVE.includes(attr.name.name)
                ) {
                    propsToMove.push(attr);
                    return false;
                }
                return true;
            });

            if (propsToMove.length === 0) return;

            // Find Trigger child and add props
            const triggerElements = j(rootPath).find(j.JSXElement, {
                openingElement: {
                    name: {
                        type: 'JSXMemberExpression',
                        object: { name: component },
                        property: { name: 'Trigger' },
                    },
                },
            });

            triggerElements.forEach((triggerPath) => {
                const triggerOpening = triggerPath.value.openingElement;
                triggerOpening.attributes = [...(triggerOpening.attributes || []), ...propsToMove];
            });
        });
    });
}
