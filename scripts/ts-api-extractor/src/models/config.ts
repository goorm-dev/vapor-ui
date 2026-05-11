// ──────────────────────────────────────────────────────────────
// Pipeline stage configs
// ──────────────────────────────────────────────────────────────

// parse 단계 전용
export interface ParseConfig {
    verbose?: boolean;
}

// filter 단계 전용
export interface FilterConfig {
    filterExternal: boolean;
    filterHtml: boolean;
    filterSprinkles: boolean;
    includeHtml?: string[];
    include?: string[];
}
