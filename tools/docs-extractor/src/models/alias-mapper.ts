import { COMPOUND_COMPONENT_BASES } from './compound-config';

/**
 * Alias Mapper - handles display name formatting for components
 *
 * Converts internal component names to display names with dot notation
 * for compound components.
 */

/**
 * Format component name to display name with dot notation for compound components
 *
 * @example
 *   formatDisplayName("MenuPopup") → "Menu.Popup"
 *   formatDisplayName("CheckboxRoot") → "Checkbox.Root"
 *   formatDisplayName("InputGroupRoot") → "InputGroup.Root"
 *   formatDisplayName("NavigationMenuTrigger") → "NavigationMenu.Trigger"
 *   formatDisplayName("Button") → "Button" (no change)
 *   formatDisplayName("IconButton") → "IconButton" (no change, not a compound component)
 */
export function formatDisplayName(compName: string): string {
    // Try each compound base (longer names first to avoid partial matches)
    for (const base of COMPOUND_COMPONENT_BASES) {
        if (compName.startsWith(base) && compName.length > base.length) {
            const subComponent = compName.slice(base.length);
            // Check if remaining part starts with uppercase (valid sub-component)
            if (/^[A-Z]/.test(subComponent)) {
                return `${base}.${subComponent}`;
            }
        }
    }

    // Return as-is for single components
    return compName;
}
