import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { PropsInfoJson } from '~/models/output';
import * as batchMqmModule from '~/translate/batch-mqm-validator';
import * as batchPostprocessModule from '~/translate/batch-postprocess';
import type * as CacheModule from '~/translate/cache';
import * as cacheModule from '~/translate/cache';
import * as postprocessModule from '~/translate/llm-postprocess';
import * as translationModule from '~/translate/llm-translation';
import * as mqmModule from '~/translate/mqm-validator';
import { translatePropsInfo } from '~/translate/pipeline';
import type { TranslationConfig } from '~/translate/types';

vi.mock('~/translate/cache', async (importOriginal) => {
    const actual = await importOriginal<typeof CacheModule>();
    return {
        ...actual,
        loadCache: vi.fn(() => new Map()),
        saveCache: vi.fn(),
    };
});

const baseConfig: TranslationConfig = {
    enabled: true,
    skipCache: false,
    targetLocale: 'ko',
    llm: {
        translationModel: 'claude-sonnet-4-6',
        validationModel: 'claude-opus-4-7',
        postprocessModel: 'claude-sonnet-4-6',
    },
    validation: {
        mqm: {
            enabled: true,
        },
    },
};

const sampleProps: PropsInfoJson[] = [
    {
        name: 'Button',
        description: 'A button component.',
        props: [
            {
                name: 'onClick',
                type: ['() => void'],
                required: false,
                description: 'Click handler callback.',
            },
        ],
    },
    {
        name: 'Divider',
        props: [],
    },
];

function mockTranslations(translations: Record<string, string>): void {
    vi.spyOn(translationModule, 'translateComponentUnits').mockImplementation(
        async (_componentName, units) => {
            return new Map(units.map((unit) => [unit.id, translations[unit.id] ?? unit.source]));
        },
    );
}

describe('translatePropsInfo', () => {
    beforeEach(() => {
        vi.spyOn(cacheModule, 'loadCache').mockReturnValue(new Map());
        vi.spyOn(cacheModule, 'saveCache').mockImplementation(() => undefined);
        vi.spyOn(batchMqmModule, 'validateBatchWithMqm').mockImplementation(
            async (_componentName, units) => ({
                ok: true,
                evaluations: new Map(
                    units.map((unit) => [unit.id, { verdict: 'PASS', errors: [] }]),
                ),
            }),
        );
        vi.spyOn(batchPostprocessModule, 'postprocessBatchWithLlm').mockImplementation(
            async (_componentName, inputs) => ({
                ok: true,
                translations: new Map(inputs.map((input) => [input.unit.id, '수정된 번역'])),
            }),
        );
        vi.spyOn(mqmModule, 'validateWithMqm').mockResolvedValue({ verdict: 'PASS', errors: [] });
        vi.spyOn(postprocessModule, 'postprocessWithLlm').mockResolvedValue({
            translated: '수정된 번역',
        });
        mockTranslations({
            'component.description': 'Button 컴포넌트입니다.',
            'props[0].onClick.description': '클릭 handler callback입니다.',
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('sends one component-scoped JSON translation request containing only cache misses', async () => {
        const cachedKey = cacheModule.makeCacheKey('Click handler callback.', baseConfig);
        vi.spyOn(cacheModule, 'loadCache').mockReturnValue(
            new Map([
                [
                    cachedKey,
                    {
                        source: 'Click handler callback.',
                        translated: '캐시된 콜백 설명입니다.',
                    },
                ],
            ]),
        );
        const translateSpy = vi.spyOn(translationModule, 'translateComponentUnits');

        const result = await translatePropsInfo(sampleProps, baseConfig, '/tmp/cache');

        expect(translateSpy).toHaveBeenCalledOnce();
        expect(translateSpy).toHaveBeenCalledWith(
            'Button',
            [
                expect.objectContaining({
                    id: 'component.description',
                    source: 'A button component.',
                }),
            ],
            baseConfig,
            expect.any(Function),
        );
        expect(batchMqmModule.validateBatchWithMqm).toHaveBeenCalledOnce();
        expect(mqmModule.validateWithMqm).not.toHaveBeenCalled();
        expect(result.props[0].description).toBe('Button 컴포넌트입니다.');
        expect(result.props[0].props[0].description).toBe('캐시된 콜백 설명입니다.');
    });

    it('keeps components with zero translation units in the report summary', async () => {
        const result = await translatePropsInfo(sampleProps, baseConfig);

        expect(result.componentReports).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    name: 'Divider',
                    totalTexts: 0,
                    verified: 0,
                    unverified: 0,
                    cached: 0,
                    gateSkipped: 0,
                }),
            ]),
        );
    });

    it('treats MQM disabled as unverified but non-reportable and does not cache it', async () => {
        const saveCacheSpy = vi.spyOn(cacheModule, 'saveCache');
        const config: TranslationConfig = {
            ...baseConfig,
            validation: { mqm: { enabled: false } },
        };

        const result = await translatePropsInfo(sampleProps, config, '/tmp/cache');

        expect(mqmModule.validateWithMqm).not.toHaveBeenCalled();
        expect(batchMqmModule.validateBatchWithMqm).not.toHaveBeenCalled();
        expect(result.componentReports[0]).toMatchObject({
            totalTexts: 2,
            verified: 0,
            unverified: 2,
            cached: 0,
            gateSkipped: 2,
        });
        const savedStore = saveCacheSpy.mock.calls[0]?.[1];
        expect(savedStore?.size).toBe(0);
    });

    it('saves only verified final outcomes to cache', async () => {
        const saveCacheSpy = vi.spyOn(cacheModule, 'saveCache');
        const initialError = {
            category: 'Accuracy/Mistranslation' as const,
            severity: 'major' as const,
            source_span: 'Click handler',
            mt_span: '클릭',
            explanation: '오역입니다.',
        };
        const finalError = {
            category: 'Accuracy/Mistranslation' as const,
            severity: 'major' as const,
            source_span: 'Click handler',
            mt_span: '수정되어도 검증 실패한 번역',
            explanation: '여전히 오역입니다.',
        };
        vi.spyOn(batchMqmModule, 'validateBatchWithMqm')
            .mockResolvedValueOnce({
                ok: true,
                evaluations: new Map([
                    ['component.description', { verdict: 'PASS', errors: [] }],
                    ['props[0].onClick.description', { verdict: 'FAIL', errors: [initialError] }],
                ]),
            })
            .mockResolvedValueOnce({
                ok: true,
                evaluations: new Map([
                    ['props[0].onClick.description', { verdict: 'FAIL', errors: [finalError] }],
                ]),
            });
        vi.spyOn(batchPostprocessModule, 'postprocessBatchWithLlm').mockResolvedValue({
            ok: true,
            translations: new Map([
                ['props[0].onClick.description', '수정되어도 검증 실패한 번역'],
            ]),
        });

        await translatePropsInfo(sampleProps.slice(0, 1), baseConfig, '/tmp/cache');

        const savedStore = saveCacheSpy.mock.calls[0]?.[1];
        expect(savedStore?.size).toBe(1);
        expect(Array.from(savedStore?.values() ?? [])).toEqual([
            {
                source: 'A button component.',
                translated: 'Button 컴포넌트입니다.',
            },
        ]);
    });

    it('keeps initial translation as unverified when postprocess response is invalid', async () => {
        vi.spyOn(batchMqmModule, 'validateBatchWithMqm').mockResolvedValue({
            ok: true,
            evaluations: new Map([
                [
                    'component.description',
                    {
                        verdict: 'FAIL',
                        errors: [
                            {
                                category: 'Accuracy/Mistranslation',
                                severity: 'major',
                                source_span: 'A button component.',
                                mt_span: 'Button 컴포넌트',
                                explanation: '문장 종결이 부자연스럽습니다.',
                            },
                        ],
                    },
                ],
            ]),
        });
        vi.spyOn(mqmModule, 'validateWithMqm').mockResolvedValue({
            verdict: 'FAIL',
            errors: [
                {
                    category: 'Accuracy/Mistranslation',
                    severity: 'major',
                    source_span: 'A button component.',
                    mt_span: 'Button 컴포넌트',
                    explanation: '문장 종결이 부자연스럽습니다.',
                },
            ],
        });
        vi.spyOn(batchPostprocessModule, 'postprocessBatchWithLlm').mockResolvedValue({
            ok: false,
            reason: 'Empty translation for id: component.description',
        });
        vi.spyOn(postprocessModule, 'postprocessWithLlm').mockResolvedValue({
            translated: 'Button 컴포넌트입니다.',
            invalid: true,
        });
        vi.spyOn(console, 'warn').mockImplementation(() => undefined);

        const result = await translatePropsInfo(
            [{ name: 'Button', description: 'A button component.', props: [] }],
            baseConfig,
        );

        expect(result.props[0].description).toBe('Button 컴포넌트입니다.');
        expect(result.componentReports[0].unverifiedOutcomes[0]).toMatchObject({
            reason: 'postprocess_response_invalid',
            source: 'A button component.',
            translated: 'Button 컴포넌트입니다.',
            reportable: true,
        });
    });

    it('allows translated text equal to source and still runs MQM validation', async () => {
        mockTranslations({
            'component.description': 'A button component.',
        });
        const propsWithDescription: PropsInfoJson[] = [
            { name: 'Button', description: 'A button component.', props: [] },
        ];

        const result = await translatePropsInfo(propsWithDescription, baseConfig);

        expect(batchMqmModule.validateBatchWithMqm).toHaveBeenCalledWith(
            'Button',
            [
                expect.objectContaining({
                    id: 'component.description',
                    source: 'A button component.',
                }),
            ],
            new Map([['component.description', 'A button component.']]),
            baseConfig,
            expect.any(Function),
            'batchMqm Button',
        );
        expect(result.props[0].description).toBe('A button component.');
    });

    it('falls back to the per-unit lifecycle when batch MQM is invalid', async () => {
        vi.spyOn(batchMqmModule, 'validateBatchWithMqm').mockResolvedValue({
            ok: false,
            reason: 'Missing evaluation id: component.description',
        });
        vi.spyOn(mqmModule, 'validateWithMqm').mockResolvedValue({
            verdict: 'PASS',
            errors: [],
        });
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

        const result = await translatePropsInfo(sampleProps.slice(0, 1), baseConfig);

        expect(mqmModule.validateWithMqm).toHaveBeenCalledTimes(2);
        expect(result.componentReports[0]).toMatchObject({
            verified: 2,
            unverified: 0,
        });
        expect(warnSpy).toHaveBeenCalledWith(
            expect.stringContaining('[i18n] batch fallback summary: 1 chunk(s) fell back.'),
        );
    });

    it('logs stage timings when verbose logging is enabled', async () => {
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

        await translatePropsInfo(sampleProps.slice(0, 1), baseConfig, '/tmp/cache', true);

        const logs = errorSpy.mock.calls.map(([message]) => String(message));
        expect(logs).toEqual(
            expect.arrayContaining([
                expect.stringMatching(/^\[i18n\] timing: collectTranslationUnits \d+ms$/),
                expect.stringMatching(/^\[i18n\] timing: loadCache \d+ms$/),
                expect.stringMatching(/^\[i18n\] timing: resolveCacheMisses \d+ms$/),
                expect.stringMatching(/^\[i18n\] timing: translateComponentUnits Button \d+ms$/),
                expect.stringMatching(/^\[i18n\] timing: batchMqm Button \d+ms$/),
                expect.stringMatching(/^\[i18n\] timing: saveCache \d+ms$/),
                expect.stringMatching(/^\[i18n\] timing: applyTranslationOutcomes \d+ms$/),
                expect.stringMatching(/^\[i18n\] timing: buildComponentReports \d+ms$/),
                expect.stringMatching(/^\[i18n\] timing: translatePropsInfo total \d+ms$/),
            ]),
        );
    });
});
