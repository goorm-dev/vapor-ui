import type { ExtractorConfig } from '~/config/schema';
import type { ComponentModel, ParsedComponent } from '~/models/pipeline';

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

export interface ExtractOutput {
    parsed: ParsedComponent[];
    models: ComponentModel[];
    props: PropsInfoJson[];
    writtenFiles: string[];
}
