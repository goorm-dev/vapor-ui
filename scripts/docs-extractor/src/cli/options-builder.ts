import type { ExtractorConfig } from '~/config';
import type { SprinklesMeta } from '~/core/defaults';
import type { ExtractOptions } from '~/core/props-extractor';

import type { RawCliOptions } from './types.js';

export function buildExtractOptions(
    raw: RawCliOptions,
    configFilterSprinkles?: boolean,
): ExtractOptions {
    return {
        filterExternal: !raw.all,
        filterSprinkles: !raw.all && (configFilterSprinkles ?? true),
        filterHtml: !raw.all,
        includeHtmlWhitelist: raw.includeHtml?.length ? new Set(raw.includeHtml) : undefined,
        include: raw.include,
    };
}

/**
 * Build component-specific extract options based on config
 */
export function buildComponentExtractOptions(
    baseOptions: ExtractOptions,
    componentConfig: ExtractorConfig['components'][string] | undefined,
    sprinklesMeta: SprinklesMeta | null,
): ExtractOptions {
    const options: ExtractOptions = {
        ...baseOptions,
        sprinklesMeta: sprinklesMeta ?? undefined,
    };

    if (!componentConfig) {
        return options;
    }

    // sprinklesAll: include all sprinkles props
    if (componentConfig.sprinklesAll) {
        options.filterSprinkles = false;
    }

    // sprinkles: include specific sprinkles props
    if (componentConfig.sprinkles?.length) {
        options.include = [...(options.include ?? []), ...componentConfig.sprinkles];
    }

    // component-specific include
    if (componentConfig.include?.length) {
        options.include = [...(options.include ?? []), ...componentConfig.include];
    }

    return options;
}
