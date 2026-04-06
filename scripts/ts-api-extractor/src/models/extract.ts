import type { Type } from 'ts-morph';

import type { ComponentModel } from '~/models/component';
import type { PropsInfoJson } from '~/models/json';
import type { ParsedComponent } from '~/models/parsed';

export interface ExtractOptions {
    filterExternal?: boolean;
    filterHtml?: boolean;
    filterSprinkles?: boolean;
    includeHtmlWhitelist?: Set<string>;
    include?: string[];
    verbose?: boolean;
}

export interface ExtractInput {
    tsconfigPath: string;
    targetFiles: string[];
    extractOptions: ExtractOptions;
    outputDir: string;
    languages: string[];
    verbose: boolean;
    resolveExtractOptions?: (filePath: string, baseOptions: ExtractOptions) => ExtractOptions;
}

export interface ExtractOutput {
    parsed: ParsedComponent[];
    models: ComponentModel[];
    props: PropsInfoJson[];
    writtenFiles: string[];
}

export interface BaseUiTypeEntry {
    type: Type;
    vaporPath: string;
}

export interface BaseUiTypeMap {
    [normalizedPath: string]: BaseUiTypeEntry;
}
