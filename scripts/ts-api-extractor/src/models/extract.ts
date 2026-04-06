import type { Type } from 'ts-morph';

import type { ExtractorConfig } from '~/config/schema';
import type { ComponentModel } from '~/models/component';
import type { PropsInfoJson } from '~/models/json';
import type { ParsedComponent } from '~/models/parsed';

export interface ParseOptions {
    filterExternal: boolean;
    filterHtml: boolean;
    filterSprinkles: boolean;
    includeHtml?: string[];
    include?: string[];
    verbose?: boolean;
}

export interface ExtractInput {
    tsconfigPath: string;
    targetFiles: string[];
    config: ExtractorConfig;
    outputDir: string;
    all: boolean;
    verbose: boolean;
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
