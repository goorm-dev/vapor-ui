import { defaultExtractorConfig } from '~/config/defaults';
import type { ExtractorConfig } from '~/config/schema';

function pathMatchesPattern(filePath: string, pattern: string): boolean {
    const normalizedFile = filePath.replace(/\\/g, '/');
    const normalizedPattern = pattern.replace(/\\/g, '/');
    return normalizedFile === normalizedPattern || normalizedFile.endsWith('/' + normalizedPattern);
}

export function resolveComponentInclude(
    filePath: string,
    config: ExtractorConfig = defaultExtractorConfig,
): string[] | undefined {
    for (const [pattern, componentConfig] of Object.entries(config.components)) {
        if (pathMatchesPattern(filePath, pattern) && componentConfig.include?.length) {
            return componentConfig.include;
        }
    }
    return undefined;
}
