export interface ComponentExtractConfig {
    include?: string[];
}

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
    components: Record<string, ComponentExtractConfig>;
    verbose: boolean;
}

/**
 * Config minus the path fields, which have no default (see config/defaults.ts).
 */
export type ExtractorDefaults = Omit<ExtractorConfig, 'inputPath' | 'tsconfig' | 'outputDir'>;

export type PartialExtractorConfig = Partial<
    Omit<ExtractorConfig, 'components'> & {
        components: Record<string, ComponentExtractConfig>;
    }
>;

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
    if (config.exclude !== undefined) assertStringArray('exclude', config.exclude);
    if (config.includeHtml !== undefined) assertStringArray('includeHtml', config.includeHtml);

    if (config.excludeDefaults !== undefined && typeof config.excludeDefaults !== 'boolean') {
        throw new Error('Invalid excludeDefaults: expected boolean');
    }
    if (config.filterExternal !== undefined && typeof config.filterExternal !== 'boolean') {
        throw new Error('Invalid filterExternal: expected boolean');
    }
    if (config.filterHtml !== undefined && typeof config.filterHtml !== 'boolean') {
        throw new Error('Invalid filterHtml: expected boolean');
    }
    if (config.filterSprinkles !== undefined && typeof config.filterSprinkles !== 'boolean') {
        throw new Error('Invalid filterSprinkles: expected boolean');
    }
    if (config.verbose !== undefined && typeof config.verbose !== 'boolean') {
        throw new Error('Invalid verbose: expected boolean');
    }

    if (config.components !== undefined) {
        if (typeof config.components !== 'object' || config.components === null) {
            throw new Error('Invalid components: expected object');
        }

        for (const [key, value] of Object.entries(config.components)) {
            if (typeof key !== 'string' || typeof value !== 'object' || value === null) {
                throw new Error('Invalid components entry');
            }

            if (value.include !== undefined) {
                assertStringArray(`components[${key}].include`, value.include);
            }
        }
    }
}

const REQUIRED_PATH_FIELDS = ['inputPath', 'tsconfig', 'outputDir'] as const;

/**
 * Path fields have no default (see config/defaults.ts), so a merged config is
 * only usable once the caller has supplied all three.
 */
function assertPathsResolved(config: Partial<ExtractorConfig>): asserts config is ExtractorConfig {
    const missing = REQUIRED_PATH_FIELDS.filter((field) => !config[field]);

    if (missing.length > 0) {
        throw new Error(
            `Missing required config field(s): ${missing.join(', ')}. ` +
                'Provide them in a config file (e.g. docs-extractor.config.mjs).',
        );
    }
}

export function mergeConfig(
    base: ExtractorDefaults,
    patch: PartialExtractorConfig,
): ExtractorConfig {
    const merged: Partial<ExtractorConfig> = {
        ...base,
        ...patch,
        exclude: patch.exclude ?? base.exclude,
        includeHtml: patch.includeHtml ?? base.includeHtml,
        components: {
            ...base.components,
            ...(patch.components ?? {}),
        },
    };

    assertPathsResolved(merged);

    return merged;
}
