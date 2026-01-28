import type { API, Collection, JSXIdentifier, JSXMemberExpression } from 'jscodeshift';

/**
 * Target package for v1/migrate transform
 */
export const TARGET_PACKAGE = '@vapor-ui/core';

/**
 * Check if the file has imports from @vapor-ui/core
 * Useful for early return optimization
 */
export function hasTargetPackageImports(
    j: API['jscodeshift'],
    root: Collection,
): boolean {
    const imports = root.find(j.ImportDeclaration, {
        source: { value: TARGET_PACKAGE },
    });

    return imports.length > 0;
}

/**
 * Get all component names imported from @vapor-ui/core
 * Returns a Set of local names (respecting aliases)
 *
 * Example:
 * - import { Menu } from '@vapor-ui/core' → Set(['Menu'])
 * - import { Menu as VaporMenu } from '@vapor-ui/core' → Set(['VaporMenu'])
 */
export function getImportedComponentNames(
    j: API['jscodeshift'],
    root: Collection,
): Set<string> {
    const componentNames = new Set<string>();

    root.find(j.ImportDeclaration, {
        source: { value: TARGET_PACKAGE },
    }).forEach((path) => {
        path.value.specifiers?.forEach((specifier) => {
            if (specifier.type === 'ImportSpecifier') {
                // Use local name (alias) if available, otherwise use imported name
                const localName = specifier.local?.name || specifier.imported.name;
                componentNames.add(localName as string);
            }
        });
    });

    return componentNames;
}

/**
 * Get the local name for a specific component from @vapor-ui/core
 * Returns undefined if the component is not imported from @vapor-ui/core
 *
 * Example:
 * - import { Tooltip } from '@vapor-ui/core' → 'Tooltip'
 * - import { Tooltip as MyTooltip } from '@vapor-ui/core' → 'MyTooltip'
 * - import { Tooltip } from 'other-lib' → undefined
 */
export function getLocalComponentName(
    j: API['jscodeshift'],
    root: Collection,
    componentName: string,
): string | undefined {
    let localName: string | undefined;

    root.find(j.ImportDeclaration, {
        source: { value: TARGET_PACKAGE },
    }).forEach((path) => {
        path.value.specifiers?.forEach((specifier) => {
            if (
                specifier.type === 'ImportSpecifier' &&
                specifier.imported.name === componentName
            ) {
                // Use local name (alias) if available, otherwise use imported name
                localName = (specifier.local?.name || specifier.imported.name) as string;
            }
        });
    });

    return localName;
}

/**
 * Get local names for multiple components from @vapor-ui/core
 * Returns a Map of original name → local name
 * Only includes components that are actually imported from @vapor-ui/core
 *
 * Example:
 * - import { Menu, Tooltip as MyTooltip } from '@vapor-ui/core'
 * - getLocalComponentNameMap(j, root, ['Menu', 'Popover', 'Tooltip'])
 * → Map { 'Menu' → 'Menu', 'Tooltip' → 'MyTooltip' }
 * (Note: Popover is not included because it's not imported)
 */
export function getLocalComponentNameMap(
    j: API['jscodeshift'],
    root: Collection,
    componentNames: string[],
): Map<string, string> {
    const nameMap = new Map<string, string>();

    root.find(j.ImportDeclaration, {
        source: { value: TARGET_PACKAGE },
    }).forEach((path) => {
        path.value.specifiers?.forEach((specifier) => {
            if (specifier.type === 'ImportSpecifier') {
                const importedName = specifier.imported.name as string;

                if (componentNames.includes(importedName)) {
                    // Use local name (alias) if available, otherwise use imported name
                    const localName = (specifier.local?.name || importedName) as string;
                    nameMap.set(importedName, localName);
                }
            }
        });
    });

    return nameMap;
}

/**
 * Extract component name from a JSX element's opening tag
 * Handles both simple identifiers and member expressions
 *
 * Examples:
 * - <Menu /> → 'Menu'
 * - <Menu.Root /> → 'Menu'
 * - <VaporMenu.Popup /> → 'VaporMenu'
 *
 * Returns undefined if the element name is not an identifier or member expression
 */
export function getComponentNameFromElement(
    elementName: JSXIdentifier | JSXMemberExpression,
): string | undefined {
    if (elementName.type === 'JSXIdentifier') {
        return elementName.name;
    } else if (elementName.type === 'JSXMemberExpression') {
        // For member expressions like Menu.Root, get the object name (Menu)
        if (elementName.object.type === 'JSXIdentifier') {
            return elementName.object.name;
        }
    }

    return undefined;
}
