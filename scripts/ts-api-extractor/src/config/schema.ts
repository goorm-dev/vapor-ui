import { mergeWith } from 'lodash-es';

export interface ExtractorConfig {
    inputPath: string;
    tsconfig: string;
    outputDir: string;
    include: string[];
    verbose: boolean;
}

export type PartialExtractorConfig = Partial<ExtractorConfig>;

function assertStringArray(name: string, value: unknown): asserts value is string[] {
    if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
        throw new Error(`Invalid ${name}: expected string[]`);
    }
}

export function validatePartialConfig(config: PartialExtractorConfig): void {
    if (config.inputPath !== undefined && typeof config.inputPath !== 'string') {
        throw new Error('Invalid inputPath: expected string');
    }
    if (config.tsconfig !== undefined && typeof config.tsconfig !== 'string') {
        throw new Error('Invalid tsconfig: expected string');
    }
    if (config.outputDir !== undefined && typeof config.outputDir !== 'string') {
        throw new Error('Invalid outputDir: expected string');
    }
    if (config.include !== undefined) assertStringArray('include', config.include);

    if (config.verbose !== undefined && typeof config.verbose !== 'boolean') {
        throw new Error('Invalid verbose: expected boolean');
    }
}

// Arrays should be replaced (not concatenated/index-merged) so user patches like
// `include: ['foo']` fully override defaults instead of partially merging.
function replaceArrays(baseValue: unknown, patchValue: unknown): unknown {
    if (Array.isArray(baseValue) || Array.isArray(patchValue)) {
        return patchValue ?? baseValue;
    }
    return undefined;
}

export function mergeConfig(base: ExtractorConfig, patch: PartialExtractorConfig): ExtractorConfig {
    return mergeWith({}, base, patch, replaceArrays) as ExtractorConfig;
}
