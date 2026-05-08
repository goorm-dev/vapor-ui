import { describe, expect, it } from 'vitest';

import { defaultExtractorConfig } from '~/config/defaults';
import { mergeConfig } from '~/config/schema';

describe('mergeConfig', () => {
    describe('translation deep merge', () => {
        it('translation.validation.mqm.enabled만 patch해도 나머지 translation 기본값이 보존된다', () => {
            const merged = mergeConfig(defaultExtractorConfig, {
                translation: {
                    validation: {
                        mqm: { enabled: false },
                    },
                },
            });

            expect(merged.translation.enabled).toBe(defaultExtractorConfig.translation.enabled);
            expect(merged.translation.skipCache).toBe(defaultExtractorConfig.translation.skipCache);
            expect(merged.translation.targetLocale).toBe(
                defaultExtractorConfig.translation.targetLocale,
            );
            expect(merged.translation.llm.translationModel).toBe(
                defaultExtractorConfig.translation.llm.translationModel,
            );
            expect(merged.translation.llm.validationModel).toBe(
                defaultExtractorConfig.translation.llm.validationModel,
            );
            expect(merged.translation.validation.mqm.enabled).toBe(false);
        });

        it('translation.llm.translationModel만 patch해도 validation.mqm 기본값이 보존된다', () => {
            const merged = mergeConfig(defaultExtractorConfig, {
                translation: {
                    llm: { translationModel: 'claude-opus-4-7' },
                },
            });

            expect(merged.translation.llm.translationModel).toBe('claude-opus-4-7');
            expect(merged.translation.validation.mqm.enabled).toBe(
                defaultExtractorConfig.translation.validation.mqm.enabled,
            );
        });

        it('translation.enabled top-level patch는 nested 기본값을 망가뜨리지 않는다', () => {
            const merged = mergeConfig(defaultExtractorConfig, {
                translation: { enabled: true },
            });

            expect(merged.translation.enabled).toBe(true);
            expect(merged.translation.llm.translationModel).toBe(
                defaultExtractorConfig.translation.llm.translationModel,
            );
            expect(merged.translation.validation.mqm.enabled).toBe(
                defaultExtractorConfig.translation.validation.mqm.enabled,
            );
        });
    });

    describe('array replace semantics', () => {
        it('exclude 배열은 patch 값으로 통째 교체된다 (merge 아님)', () => {
            const base = { ...defaultExtractorConfig, exclude: ['default-a', 'default-b'] };
            const merged = mergeConfig(base, { exclude: ['user-only'] });

            expect(merged.exclude).toEqual(['user-only']);
        });

        it('includeHtml 배열은 patch 값으로 통째 교체된다', () => {
            const base = { ...defaultExtractorConfig, includeHtml: ['className', 'id'] };
            const merged = mergeConfig(base, { includeHtml: ['data-testid'] });

            expect(merged.includeHtml).toEqual(['data-testid']);
        });

        it('components[key].include 배열은 patch 값으로 통째 교체된다', () => {
            const base = {
                ...defaultExtractorConfig,
                components: { 'button.tsx': { include: ['size', 'variant'] } },
            };
            const merged = mergeConfig(base, {
                components: { 'button.tsx': { include: ['disabled'] } },
            });

            expect(merged.components['button.tsx']?.include).toEqual(['disabled']);
        });

        it('patch에 exclude가 없으면 base의 exclude가 보존된다', () => {
            const base = { ...defaultExtractorConfig, exclude: ['default-a'] };
            const merged = mergeConfig(base, {});

            expect(merged.exclude).toEqual(['default-a']);
        });
    });

    describe('top-level scalars', () => {
        it('verbose 같은 top-level 필드는 patch 값으로 교체된다', () => {
            const merged = mergeConfig(defaultExtractorConfig, { verbose: true });
            expect(merged.verbose).toBe(true);
        });

        it('patch에 없는 top-level 필드는 base 값이 유지된다', () => {
            const merged = mergeConfig(defaultExtractorConfig, { verbose: true });
            expect(merged.tsconfig).toBe(defaultExtractorConfig.tsconfig);
            expect(merged.outputDir).toBe(defaultExtractorConfig.outputDir);
        });
    });

    describe('immutability', () => {
        it('base 객체를 mutate하지 않는다', () => {
            const base = {
                ...defaultExtractorConfig,
                translation: structuredClone(defaultExtractorConfig.translation),
            };
            const snapshot = structuredClone(base);

            mergeConfig(base, {
                translation: { enabled: true, llm: { translationModel: 'claude-opus-4-7' } },
            });

            expect(base).toEqual(snapshot);
        });
    });
});
