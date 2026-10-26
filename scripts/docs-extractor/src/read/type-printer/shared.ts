import type { PublicNames } from '#read/public-names';
import { TypeFormatFlags } from 'ts-morph';

export const TYPE_FORMAT_FLAGS =
    TypeFormatFlags.UseAliasDefinedOutsideCurrentScope |
    TypeFormatFlags.NoTruncation |
    TypeFormatFlags.WriteTypeArgumentsOfSignature;

/** What a printer is made with, once per component namespace. */
export interface TypePrinterOptions {
    publicNames: PublicNames;
    /** The component namespace being documented. Its alias names win when several fit. */
    namespace: string;
}
