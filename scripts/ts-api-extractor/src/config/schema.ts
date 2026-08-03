export interface ExtractorConfig {
    inputPath: string;
    tsconfig: string;
    exclude: string[];
    excludeDefaults: boolean;
    outputDir: string;
    filterExternal: boolean;
    filterHtml: boolean;
    filterSprinkles: boolean;
    includeHtml?: string[];
}
