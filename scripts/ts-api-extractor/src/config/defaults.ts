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

export function resolvePackagePaths(packageName: string): { inputPath: string; tsconfig: string } {
    return {
        inputPath: path.join(monorepoRoot, 'packages', packageName, 'src'),
        tsconfig: path.join(monorepoRoot, 'packages', packageName, 'tsconfig.json'),
    };
}

export const defaultExtractorConfig: ExtractorConfig = {
    ...resolvePackagePaths('core'),
    outputDir: path.join(monorepoRoot, 'apps/website/public/components/generated'),
    include: ['className', 'style'],
    verbose: false,
};
