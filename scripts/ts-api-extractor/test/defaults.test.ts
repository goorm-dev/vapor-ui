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
        const inputRoot = defaultExtractorConfig.inputPath.replace(
            new RegExp(`${path.sep}packages${path.sep}core$`),
            '',
        );
        const tsconfigRoot = defaultExtractorConfig.tsconfig.replace(
            new RegExp(`${path.sep}packages${path.sep}core${path.sep}tsconfig\\.json$`),
            '',
        );
        const outputRoot = defaultExtractorConfig.outputDir.replace(
            new RegExp(
                `${path.sep}apps${path.sep}website${path.sep}public${path.sep}components${path.sep}generated$`,
            ),
            '',
        );

        expect(inputRoot).toBe(tsconfigRoot);
        expect(tsconfigRoot).toBe(outputRoot);
    });
});
