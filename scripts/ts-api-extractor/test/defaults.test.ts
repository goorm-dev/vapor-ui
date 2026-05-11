import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { defaultExtractorConfig, resolvePackagePaths } from '~/config/defaults';

describe('defaultExtractorConfig', () => {
    it('inputPath는 monorepo root 기준 절대 경로다', () => {
        expect(path.isAbsolute(defaultExtractorConfig.inputPath)).toBe(true);
        expect(
            defaultExtractorConfig.inputPath.endsWith(path.join('packages', 'core', 'src')),
        ).toBe(true);
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

    it('inputPath와 tsconfig는 동일한 monorepo root에서 파생된다', () => {
        const inputRoot = path.resolve(defaultExtractorConfig.inputPath, '..', '..', '..');
        const tsconfigRoot = path.resolve(defaultExtractorConfig.tsconfig, '..', '..', '..');
        expect(inputRoot).toBe(tsconfigRoot);
    });
});

describe('resolvePackagePaths', () => {
    it('패키지명으로 inputPath를 파생한다', () => {
        const paths = resolvePackagePaths('hooks');
        expect(path.isAbsolute(paths.inputPath)).toBe(true);
        expect(paths.inputPath.endsWith(path.join('packages', 'hooks', 'src'))).toBe(true);
    });

    it('패키지명으로 tsconfig 경로를 파생한다', () => {
        const paths = resolvePackagePaths('hooks');
        expect(path.isAbsolute(paths.tsconfig)).toBe(true);
        expect(paths.tsconfig.endsWith(path.join('packages', 'hooks', 'tsconfig.json'))).toBe(true);
    });

    it('패키지명이 달라지면 경로도 달라진다', () => {
        const core = resolvePackagePaths('core');
        const hooks = resolvePackagePaths('hooks');
        expect(core.inputPath).not.toBe(hooks.inputPath);
        expect(core.tsconfig).not.toBe(hooks.tsconfig);
    });
});
