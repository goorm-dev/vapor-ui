export interface ExtractOptions {
    filterExternal?: boolean;
    filterHtml?: boolean;
    filterSprinkles?: boolean;
    includeHtmlWhitelist?: Set<string>;
    include?: string[];
    verbose?: boolean;
}
