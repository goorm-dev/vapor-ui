import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CliError, applyFlagOverrides } from '~/cli/options';
import type { ExtractorConfig } from '~/config/schema';

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

describe('applyFlagOverrides', () => {
    beforeEach(() => {
        vi.stubEnv('DEEPL_API_KEY', 'test-key');
    });

    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it('--translate 플래그가 없으면 translation.enabled를 변경하지 않는다', () => {
        const config = makeConfig();
        applyFlagOverrides(config, { translate: false });
        expect(config.translation?.enabled).toBe(false);
    });

    it('--translate 플래그가 있고 DEEPL_API_KEY가 설정되어 있으면 translation.enabled를 true로 변경한다', () => {
        const config = makeConfig();
        applyFlagOverrides(config, { translate: true });
        expect(config.translation?.enabled).toBe(true);
    });

    it('--translate 플래그가 있고 DEEPL_API_KEY가 없으면 CliError를 던진다', () => {
        vi.stubEnv('DEEPL_API_KEY', '');
        const config = makeConfig();

        expect(() => applyFlagOverrides(config, { translate: true })).toThrowError(CliError);
    });

    it('CliError 메시지에 DEEPL_API_KEY와 .env 설정 방법이 포함된다', () => {
        vi.stubEnv('DEEPL_API_KEY', '');
        const config = makeConfig();

        expect(() => applyFlagOverrides(config, { translate: true })).toThrowError(/DEEPL_API_KEY/);
    });

    it('--skip-cache 플래그가 있으면 translation.skipCache를 true로 변경한다', () => {
        const config = makeConfig();
        applyFlagOverrides(config, { skipCache: true });
        expect(config.translation?.skipCache).toBe(true);
    });

    it('--verbose 플래그가 있으면 config.verbose를 true로 변경한다', () => {
        const config = makeConfig();
        applyFlagOverrides(config, { verbose: true });
        expect(config.verbose).toBe(true);
    });

    it('translation 설정이 없는 config에서 --translate를 사용해도 CliError를 던진다', () => {
        vi.stubEnv('DEEPL_API_KEY', '');
        const config = makeConfig({ translation: undefined });

        expect(() => applyFlagOverrides(config, { translate: true })).toThrowError(CliError);
    });
});
