import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CliError, resolveRunContext } from '~/cli/options';
import { loadExtractorConfig } from '~/config/loader';
import type { ExtractorConfig } from '~/config/schema';
import { findComponentFiles, findFileByComponentName } from '~/stages/scan';

const baseTranslationConfig = {
    enabled: false,
    skipCache: false,
    targetLocale: 'ko' as const,
    llm: { enabled: true },
    validation: { mqm: { enabled: true, failOnError: false } },
};

function makeConfig(overrides: Partial<ExtractorConfig> = {}): ExtractorConfig {
    return {
        inputPath: './src/components',
        tsconfig: './tsconfig.json',
        exclude: [],
        excludeDefaults: true,
        outputDir: './dist',
        filterExternal: true,
        filterHtml: true,
        filterSprinkles: true,
        components: {},
        all: false,
        verbose: false,
        translation: { ...baseTranslationConfig },
        ...overrides,
    };
}

vi.mock('~/config/loader', () => ({
    loadExtractorConfig: vi.fn(),
}));

vi.mock('~/stages/scan', () => ({
    findComponentFiles: vi.fn(),
    findFileByComponentName: vi.fn(),
}));

const mockedLoadExtractorConfig = vi.mocked(loadExtractorConfig);
const mockedFindComponentFiles = vi.mocked(findComponentFiles);
const mockedFindFileByComponentName = vi.mocked(findFileByComponentName);

describe('resolveRunContext', () => {
    beforeEach(() => {
        vi.stubEnv('DEEPL_API_KEY', 'test-key');
        mockedLoadExtractorConfig.mockReset();
        mockedFindComponentFiles.mockReset();
        mockedFindFileByComponentName.mockReset();

        // Default: input path & tsconfig point to existing files in cwd
        mockedLoadExtractorConfig.mockResolvedValue(
            makeConfig({ inputPath: '.', tsconfig: './package.json' }),
        );
        mockedFindComponentFiles.mockResolvedValue(['/abs/Button.tsx']);
        mockedFindFileByComponentName.mockReturnValue('/abs/Button.tsx');
    });

    afterEach(() => {
        vi.unstubAllEnvs();
    });

    describe('flag overrides', () => {
        it('--translate 플래그가 없으면 translation.enabled를 변경하지 않는다', async () => {
            const resolved = await resolveRunContext({ translation: { translate: false } });
            expect(resolved.config.translation?.enabled).toBe(false);
        });

        it('--translate 플래그가 있고 DEEPL_API_KEY가 설정되어 있으면 translation.enabled를 true로 변경한다', async () => {
            const resolved = await resolveRunContext({ translation: { translate: true } });
            expect(resolved.config.translation?.enabled).toBe(true);
        });

        it('--translate 플래그가 있고 DEEPL_API_KEY가 없으면 CliError를 던진다', async () => {
            vi.stubEnv('DEEPL_API_KEY', '');
            await expect(
                resolveRunContext({ translation: { translate: true } }),
            ).rejects.toThrowError(CliError);
        });

        it('CliError 메시지에 DEEPL_API_KEY가 포함된다', async () => {
            vi.stubEnv('DEEPL_API_KEY', '');
            await expect(
                resolveRunContext({ translation: { translate: true } }),
            ).rejects.toThrowError(/DEEPL_API_KEY/);
        });

        it('--skip-cache 플래그가 있으면 translation.skipCache를 true로 변경한다', async () => {
            const resolved = await resolveRunContext({ translation: { skipCache: true } });
            expect(resolved.config.translation?.skipCache).toBe(true);
        });

        it('--verbose 플래그가 있으면 config.verbose를 true로 변경한다', async () => {
            const resolved = await resolveRunContext({ verbose: true });
            expect(resolved.config.verbose).toBe(true);
        });

        it('loader가 반환한 원본 config 객체를 mutate하지 않는다', async () => {
            const loaded = makeConfig({ inputPath: '.' });
            mockedLoadExtractorConfig.mockResolvedValue(loaded);

            await resolveRunContext({
                translation: { translate: true, skipCache: true },
                verbose: true,
            });

            expect(loaded.verbose).toBe(false);
            expect(loaded.translation?.enabled).toBe(false);
            expect(loaded.translation?.skipCache).toBe(false);
        });
    });

    describe('run context resolution', () => {
        it('component 인자가 없으면 모든 파일을 targetFiles로 반환한다', async () => {
            mockedFindComponentFiles.mockResolvedValue(['/abs/A.tsx', '/abs/B.tsx']);

            const resolved = await resolveRunContext({});

            expect(resolved.targetFiles).toEqual(['/abs/A.tsx', '/abs/B.tsx']);
        });

        it('component 인자가 있으면 해당 컴포넌트 파일만 반환한다', async () => {
            mockedFindComponentFiles.mockResolvedValue(['/abs/A.tsx', '/abs/B.tsx']);
            mockedFindFileByComponentName.mockReturnValue('/abs/B.tsx');

            const resolved = await resolveRunContext({ component: 'B' });

            expect(resolved.targetFiles).toEqual(['/abs/B.tsx']);
        });

        it('component 인자에 매칭되는 파일이 없으면 CliError를 던진다', async () => {
            mockedFindComponentFiles.mockResolvedValue(['/abs/A.tsx']);
            mockedFindFileByComponentName.mockReturnValue(null);

            await expect(resolveRunContext({ component: 'Missing' })).rejects.toThrowError(
                CliError,
            );
        });

        it('스캔 결과가 비어있으면 CliError를 던진다', async () => {
            mockedFindComponentFiles.mockResolvedValue([]);

            await expect(resolveRunContext({})).rejects.toThrowError(CliError);
        });

        it('tsconfig 파일이 존재하지 않으면 CliError를 던진다', async () => {
            mockedLoadExtractorConfig.mockResolvedValue(
                makeConfig({ inputPath: '.', tsconfig: './does-not-exist.json' }),
            );

            await expect(resolveRunContext({})).rejects.toThrowError(/tsconfig/i);
        });
    });
});
