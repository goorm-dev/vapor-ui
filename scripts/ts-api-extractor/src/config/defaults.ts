import { findUpSync } from 'find-up';
import path from 'node:path';

import type { ExtractorConfig } from '~/config/schema';

// `pnpm-workspace.yaml` marks the monorepo root. This tool is only meaningful
// inside the vapor-ui monorepo, so absolute defaults derived from the root let
// `ts-api-extractor` run from any cwd inside the repo without breaking.
const ROOT_MARKER = 'pnpm-workspace.yaml';

function findMonorepoRoot(): string {
    const markerPath = findUpSync(ROOT_MARKER);
    if (!markerPath) {
        throw new Error(
            `@vapor-ui/ts-api-extractor: could not locate monorepo root (no ${ROOT_MARKER} found upward from ${process.cwd()})`,
        );
    }
    return path.dirname(markerPath);
}

const monorepoRoot = findMonorepoRoot();

/**
 * Default extractor configuration.
 *
 * Path defaults are absolute, derived from the monorepo root located via
 * `pnpm-workspace.yaml`. Users may still override any of them in their
 * `docs-extractor.config.mjs`.
 */
export const defaultExtractorConfig: ExtractorConfig = {
    inputPath: path.join(monorepoRoot, 'packages/core'),
    tsconfig: path.join(monorepoRoot, 'packages/core/tsconfig.json'),
    exclude: [],
    excludeDefaults: true,
    outputDir: path.join(monorepoRoot, 'apps/website/public/components/generated'),
    filterExternal: true,
    filterHtml: true,
    filterSprinkles: true,
    includeHtml: ['className'],
    components: {},
    all: false,
    verbose: false,
    translation: {
        enabled: false,
        skipCache: false,
        targetLocale: 'ko',
        llm: {
            enabled: true,
        },
        validation: {
            mqm: {
                enabled: true,
                failOnError: false,
            },
        },
    },
};
