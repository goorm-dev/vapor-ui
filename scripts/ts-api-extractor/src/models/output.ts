import type { ExtractorConfig } from '~/config/schema';

// ──────────────────────────────────────────────────────────────
// JSON output format
// ──────────────────────────────────────────────────────────────

export interface PropertyJson {
    name: string;
    type: string[];
    required: boolean;
    description?: string;
    defaultValue?: string;
}

export interface PropsInfoJson {
    name: string;
    description?: string;
    props: PropertyJson[];
}

// ──────────────────────────────────────────────────────────────
// extract() public API
// ──────────────────────────────────────────────────────────────

export interface ExtractInput {
    tsconfigPath: string;
    targetFiles: string[];
    config: ExtractorConfig;
}
