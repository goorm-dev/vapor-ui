import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { defaultExtractorConfig } from '~/config/defaults';

describe('defaultExtractorConfig', () => {
    it('inputPath는 monorepo root 기준 절대 경로다', () => {
        expect(path.isAbsolute(defaultExtractorConfig.inputPath)).toBe(true);
        expect(defaultExtractorConfig.inputPath.endsWith(path.join('packages', 'core'))).toBe(true);
    });

    it('tsconfig는 monorepo root 기준 절대 경로다', () => {
        expect(path.isAbsolute(defaultExtractorConfig.tsconfig)).toBe(true);
        expect(
            defaultExtractorConfig.tsconfig.endsWith(
                path.join('packages', 'core', 'tsconfig.json'),
            ),
        ).toBe(true);
    });

    it('outputDir는 monorepo root 기준 절대 경로다', () => {
        expect(path.isAbsolute(defaultExtractorConfig.outputDir)).toBe(true);
        expect(
            defaultExtractorConfig.outputDir.endsWith(
                path.join('apps', 'website', 'public', 'components', 'generated'),
            ),
        ).toBe(true);
    });

    it('세 경로 모두 동일한 monorepo root에서 파생된다', () => {
        // path.resolve with '..' is cross-platform; RegExp with path.sep breaks on Windows
        const inputRoot = path.resolve(defaultExtractorConfig.inputPath, '..', '..');
        const tsconfigRoot = path.resolve(defaultExtractorConfig.tsconfig, '..', '..', '..');
        const outputRoot = path.resolve(
            defaultExtractorConfig.outputDir,
            '..',
            '..',
            '..',
            '..',
            '..',
        );

        expect(inputRoot).toBe(tsconfigRoot);
        expect(tsconfigRoot).toBe(outputRoot);
    });
});
