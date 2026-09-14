import path from 'node:path';

import type { ExtractorConfig } from '~/domain/config/schema';
import { loadExtractorConfig } from '~/infrastructure/config/loader';
import { resolveTargetFiles } from '~/infrastructure/fs/component-scanner';

export interface ResolvedCliOptions {
    tsconfigPath: string;
    targetFiles: string[];
    config: ExtractorConfig;
}

/**
 * Maps CLI flags onto the inputs `extract()` needs. Every filesystem decision is
 * delegated — this file only translates.
 */
export async function resolveOptions({
    configPath,
    component,
}: {
    component?: string;
    configPath?: string;
}): Promise<ResolvedCliOptions> {
    const config = await loadExtractorConfig({ configPath });

    return {
        tsconfigPath: path.resolve(process.cwd(), config.tsconfig),
        targetFiles: await resolveTargetFiles(config, component),
        config,
    };
}
