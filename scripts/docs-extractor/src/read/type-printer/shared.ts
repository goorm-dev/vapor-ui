import type { Reporter } from '#reporter';
import { type Type, TypeFormatFlags } from 'ts-morph';

/**
 * Maps a base-ui type (by qualified path or symbol name) to the public vapor-ui
 * path that documentation should display. Built per source file by base-ui-mapper.
 */
interface BaseUiTypeEntry {
    type: Type;
    vaporPath: string;
    /** The vapor-ui namespace that declares the alias, e.g. `CollapsibleRoot`. */
    namespace: string;
}

export interface BaseUiTypeMap {
    [normalizedPath: string]: BaseUiTypeEntry;
}

export const TYPE_FORMAT_FLAGS =
    TypeFormatFlags.UseAliasDefinedOutsideCurrentScope |
    TypeFormatFlags.NoTruncation |
    TypeFormatFlags.WriteTypeArgumentsOfSignature;

/** What a printer is made with, once per component namespace. */
export interface TypePrinterOptions {
    baseUiMap: BaseUiTypeMap;
    /** The component namespace being documented. Its alias names win when several fit. */
    namespace: string;
    reporter: Reporter;
}
