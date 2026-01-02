/**
 * Compound component configuration
 *
 * List of compound component base names.
 * Components in this list have sub-components (e.g., Dialog.Root, Menu.Item)
 *
 * IMPORTANT: Sorted by length descending for proper prefix matching.
 * Longer names must come first to avoid partial matches
 * (e.g., "NavigationMenu" before "Menu", "InputGroup" before "Input")
 */
export const COMPOUND_COMPONENT_BASES = [
    'NavigationMenu', // 14 chars
    'AlertDialog', // 11 chars
    'MultiSelect', // 11 chars
    'Collapsible', // 11 chars
    'InputGroup', // 10 chars
    'RadioGroup', // 10 chars
    'Breadcrumb', // 10 chars
    'Pagination', // 10 chars
    'Accordion', // 9 chars
    'Checkbox', // 8 chars
    'Progress', // 8 chars
    'Popover', // 7 chars
    'Tooltip', // 7 chars
    'Toolbar', // 7 chars
    'Callout', // 7 chars
    'Avatar', // 6 chars
    'Dialog', // 6 chars
    'Select', // 6 chars
    'Slider', // 6 chars
    'Switch', // 6 chars
    'Field', // 5 chars
    'Sheet', // 5 chars
    'Table', // 5 chars
    'Toast', // 5 chars
    'Radio', // 5 chars
    'Card', // 4 chars
    'Form', // 4 chars
    'Grid', // 4 chars
    'Menu', // 4 chars
    'Tabs', // 4 chars
] as const;

export type CompoundComponentBase = (typeof COMPOUND_COMPONENT_BASES)[number];

/**
 * Check if a component name is a known compound component base
 */
export function isCompoundBase(name: string): name is CompoundComponentBase {
    return COMPOUND_COMPONENT_BASES.includes(name as CompoundComponentBase);
}
