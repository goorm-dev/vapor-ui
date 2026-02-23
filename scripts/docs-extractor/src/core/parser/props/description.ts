/**
 * Prop description extraction module
 *
 * Extracts JSDoc descriptions from symbols.
 */
import { type Symbol, ts } from 'ts-morph';

export function getPropDescription(symbol: Symbol): string | undefined {
    const docs = symbol.compilerSymbol.getDocumentationComment(undefined);
    if (docs.length === 0) return undefined;
    return ts.displayPartsToString(docs) || undefined;
}
