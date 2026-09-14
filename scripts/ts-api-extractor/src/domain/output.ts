import type { ExtractorConfig } from '~/domain/config/schema';
import type { ComponentModel, ParsedComponent } from '~/domain/model';
import type { OutputFormat } from '~/domain/output-format';
import type { Reporter } from '~/domain/reporter';

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
    /** Defaults to a silent reporter, so library use produces no output. */
    reporter?: Reporter;
    /** Defaults to JSON. */
    format?: OutputFormat;
    /** 이번 추출에 없는 기존 산출물을 지운다. 전체 추출일 때만 켠다. */
    prune?: boolean;
}

export interface ExtractOutput {
    parsed: ParsedComponent[];
    models: ComponentModel[];
    props: PropsInfoJson[];
    writtenFiles: string[];
}
