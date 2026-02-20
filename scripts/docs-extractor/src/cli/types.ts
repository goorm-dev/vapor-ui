import type { ExtractOptions } from '~/core/props-extractor';

/** meow에서 파싱된 raw 옵션 */
export interface RawCliOptions {
    path?: string;
    tsconfig?: string;
    exclude: string[];
    excludeDefaults: boolean;
    component?: string;
    outputDir?: string;
    all: boolean;
    include?: string[];
    includeHtml?: string[];
    config?: string;
    noConfig?: boolean;
    lang?: string;
    verbose?: boolean;
}

/** 프롬프트/검증 후 확정된 옵션 */
export interface ResolvedCliOptions {
    absolutePath: string;
    tsconfigPath: string;
    targetFiles: string[];
    extractOptions: ExtractOptions;
    outputMode: OutputMode;
    verbose: boolean;
}

export type OutputMode = { type: 'stdout' } | { type: 'directory'; path: string };

/** 스캔된 컴포넌트 파일 정보 */
export interface ScannedComponent {
    filePath: string;
    componentName: string;
}

/** 유효성 검사 결과 */
export type ValidationResult =
    | { valid: true; file: string }
    | { valid: false; available: string[] };
