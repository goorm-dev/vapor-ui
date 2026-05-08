import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { PropsInfoJson } from '~/models/output';
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
        );
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
        vi.spyOn(mqmModule, 'validateWithMqm')
            .mockResolvedValueOnce({ verdict: 'PASS', errors: [] })
            .mockResolvedValueOnce({
                verdict: 'FAIL',
                errors: [
                    {
                        category: 'Accuracy/Mistranslation',
                        severity: 'major',
                        source_span: 'Click handler',
                        mt_span: '클릭',
                        explanation: '오역입니다.',
                    },
                ],
            })
            .mockResolvedValueOnce({
                verdict: 'FAIL',
                errors: [
                    {
                        category: 'Accuracy/Mistranslation',
                        severity: 'major',
                        source_span: 'Click handler',
                        mt_span: '수정되어도 검증 실패한 번역',
                        explanation: '여전히 오역입니다.',
                    },
                ],
            });
        vi.spyOn(postprocessModule, 'postprocessWithLlm').mockResolvedValue({
            translated: '수정되어도 검증 실패한 번역',
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
        vi.spyOn(postprocessModule, 'postprocessWithLlm').mockResolvedValue({
            translated: 'Button 컴포넌트입니다.',
            invalid: true,
        });

        const result = await translatePropsInfo(sampleProps.slice(0, 1), baseConfig);

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

        expect(mqmModule.validateWithMqm).toHaveBeenCalledWith(
            'A button component.',
            'A button component.',
            baseConfig,
        );
        expect(result.props[0].description).toBe('A button component.');
    });
});
