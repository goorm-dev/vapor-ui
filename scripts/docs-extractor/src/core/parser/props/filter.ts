/**
 * Prop filtering module
 *
 * Determines which props to include/exclude from extraction output.
 */
import type { Symbol } from 'ts-morph';

import type { ExtractOptions } from '~/core/parser/types';

import { isSymbolFromExternalSource, isSymbolFromSprinkles } from '../type/declaration-source';

/**
 * Deprecated sprinkles CSS props defined in VComponentProps.
 * These are declared in types.ts, not sprinkles.css.ts, so need explicit filtering.
 */
const DEPRECATED_CSS_PROPS = new Set([
    '$css',
    'position',
    'display',
    'alignItems',
    'justifyContent',
    'flexDirection',
    'gap',
    'alignContent',
    'padding',
    'paddingTop',
    'paddingBottom',
    'paddingLeft',
    'paddingRight',
    'paddingX',
    'paddingY',
    'margin',
    'marginTop',
    'marginBottom',
    'marginLeft',
    'marginRight',
    'marginX',
    'marginY',
    'width',
    'height',
    'minWidth',
    'minHeight',
    'maxWidth',
    'maxHeight',
    'border',
    'borderColor',
    'borderRadius',
    'backgroundColor',
    'color',
    'opacity',
    'pointerEvents',
    'overflow',
    'textAlign',
]);

/**
 * Check if prop name is an HTML attribute pattern (data-*, aria-*).
 */
function isHtmlAttribute(name: string): boolean {
    return name.startsWith('data-') || name.startsWith('aria-');
}

/**
 * Check if prop is a deprecated CSS/sprinkles prop.
 */
function isDeprecatedCssProp(name: string): boolean {
    return DEPRECATED_CSS_PROPS.has(name);
}

export function shouldIncludeSymbol(
    symbol: Symbol,
    options: ExtractOptions,
    includeSet: Set<string>,
): boolean {
    const name = symbol.getName();

    if (includeSet.has(name)) return true;

    if (options.includeHtmlWhitelist?.has(name)) return true;

    // Exclude React/DOM/external library types (based on declaration source)
    if (options.filterExternal && isSymbolFromExternalSource(symbol)) return false;

    if (options.filterHtml !== false && isHtmlAttribute(name)) return false;

    // Exclude sprinkles props (style props defined in sprinkles.css.ts)
    if (options.filterSprinkles !== false && isSymbolFromSprinkles(symbol)) return false;

    // Exclude deprecated CSS props ($css, margin, padding, etc.)
    if (options.filterSprinkles !== false && isDeprecatedCssProp(name)) return false;

    return true;
}
