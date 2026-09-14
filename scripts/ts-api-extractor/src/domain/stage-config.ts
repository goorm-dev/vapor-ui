import type { Reporter } from '~/domain/reporter';

// ──────────────────────────────────────────────────────────────
// Pipeline stage configs
// ──────────────────────────────────────────────────────────────

// parse 단계 전용
export interface ParseConfig {
    reporter?: Reporter;
}

// filter 단계 전용
export interface FilterConfig {
    filterExternal: boolean;
    filterHtml: boolean;
    filterSprinkles: boolean;
    includeHtml?: string[];
    include?: string[];
}
