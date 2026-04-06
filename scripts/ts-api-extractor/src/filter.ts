/**
 * Prop filtering module
 *
 * Determines which props to include/exclude from extraction output.
 */
import type { Symbol as TsSymbol } from 'ts-morph';

import { isSymbolFromExternalSource, isSymbolFromSprinkles } from '~/declaration-source';
import type { ExtractOptions } from '~/models/extract';

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

function isHtmlAttribute(name: string): boolean {
    return name.startsWith('data-') || name.startsWith('aria-');
}

function isDeprecatedCssProp(name: string): boolean {
    return DEPRECATED_CSS_PROPS.has(name);
}

export function shouldIncludeSymbol(
    symbol: TsSymbol,
    options: ExtractOptions,
    includeSet: Set<string>,
): boolean {
    const name = symbol.getName();

    if (includeSet.has(name)) return true;
    if (options.includeHtmlWhitelist?.has(name)) return true;
    if (options.filterExternal && isSymbolFromExternalSource(symbol)) return false;
    if (options.filterHtml !== false && isHtmlAttribute(name)) return false;
    if (options.filterSprinkles !== false && isSymbolFromSprinkles(symbol)) return false;
    if (options.filterSprinkles !== false && isDeprecatedCssProp(name)) return false;

    return true;
}
