/**
 * Prop filtering module
 *
 * Determines which props to include/exclude from extraction output,
 * and extracts documentation metadata (JSDoc descriptions, @default tags) from symbols.
 */
import { type Symbol, ts } from 'ts-morph';

import type { SprinklesMeta } from '../defaults/sprinkles-analyzer';
import { getSymbolSourcePath, isSymbolFromExternalSource } from '../shared/declaration-source';
import { isHtmlAttribute } from './html-attributes';

export interface ExtractOptions {
    filterExternal?: boolean;
    filterSprinkles?: boolean;
    filterHtml?: boolean;
    includeHtmlWhitelist?: Set<string>;
    include?: string[];
    sprinklesMeta?: SprinklesMeta;
    verbose?: boolean;
}

/** Sprinkles CSS file pattern */
const SPRINKLES_FILE_PATTERN = 'sprinkles.css';

function isSprinklesProp(symbol: Symbol): boolean {
    const filePath = getSymbolSourcePath(symbol);
    if (!filePath) return false;
    return filePath.includes(SPRINKLES_FILE_PATTERN);
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

    if (options.filterSprinkles && isSprinklesProp(symbol)) return false;

    if (options.filterHtml !== false && isHtmlAttribute(name)) return false;

    return true;
}

export function getPropDescription(symbol: Symbol): string | undefined {
    const docs = symbol.compilerSymbol.getDocumentationComment(undefined);
    if (docs.length === 0) return undefined;
    return ts.displayPartsToString(docs) || undefined;
}

export function getJsDocDefault(symbol: Symbol): string | undefined {
    const tags = symbol.compilerSymbol.getJsDocTags();
    const defaultTag = tags.find((tag) => tag.name === 'default');
    if (!defaultTag?.text) return undefined;
    return ts.displayPartsToString(defaultTag.text) || undefined;
}
