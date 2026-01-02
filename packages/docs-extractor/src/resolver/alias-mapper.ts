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

/**
 * Parse a display name back to internal name
 *
 * @example
 *   parseDisplayName("Menu.Popup") → "MenuPopup"
 *   parseDisplayName("Checkbox.Root") → "CheckboxRoot"
 *   parseDisplayName("Button") → "Button"
 */
export function parseDisplayName(displayName: string): string {
    return displayName.replace('.', '');
}

/**
 * Split display name into base and sub-component parts
 *
 * @example
 *   splitDisplayName("Menu.Popup") → { base: "Menu", sub: "Popup" }
 *   splitDisplayName("Button") → { base: "Button", sub: undefined }
 */
export function splitDisplayName(displayName: string): { base: string; sub?: string } {
    const parts = displayName.split('.');
    return {
        base: parts[0],
        sub: parts.length > 1 ? parts[1] : undefined,
    };
}

/**
 * Check if a display name represents a compound component
 */
export function isCompoundDisplayName(displayName: string): boolean {
    return displayName.includes('.');
}

/**
 * Get all possible sub-component names for a compound component base
 * This is used for compound component analysis
 */
export function getCompoundSubComponents(baseName: string, allNames: string[]): string[] {
    return allNames
        .filter((name) => name.startsWith(baseName) && name.length > baseName.length)
        .map((name) => name.slice(baseName.length))
        .filter((sub) => /^[A-Z]/.test(sub));
}
