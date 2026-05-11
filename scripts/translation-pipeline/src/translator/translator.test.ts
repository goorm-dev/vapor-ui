import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import * as cacheModule from '~/cache/cache';
import * as postprocessModule from '~/postprocess/postprocess';
import * as clientModule from '~/translation/client';
import * as translationModule from '~/translation/translate';
import { translatePropsInfo } from '~/translator/translator';
import type { TranslatableDoc, TranslationConfig } from '~/types';
import * as mqmModule from '~/validation/validator';

const baseConfig: TranslationConfig = {
    skipCache: false,
    targetLocale: 'ko',
    llm: {
        translationModel: 'claude-sonnet-4-6',
        validationModel: 'claude-opus-4-7',
        postprocessModel: 'claude-opus-4-7',
    },
};

const sampleProps: TranslatableDoc[] = [
    {
        name: 'Button',
        description: 'A button component.',
        props: [{ name: 'onClick', description: 'Click handler callback.' }],
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

function mockBatchMqmPass(): void {
    vi.spyOn(clientModule, 'callLlm').mockImplementation(async (messages) => {
        const userContent = messages.find((m) => m.role === 'user')?.content ?? '';
        // batch MQM — user message is JSON with units array
        try {
            const parsed = JSON.parse(userContent) as { units?: { id: string }[] };
            if (Array.isArray(parsed.units)) {
                const evaluations = parsed.units.map(({ id }: { id: string }) => ({
                    id,
                    verdict: 'PASS',
                    errors: [],
                }));
                return {
                    content: JSON.stringify({ evaluations }),
                    inputTokens: 0,
                    outputTokens: 0,
                    cost: 0,
                };
            }
        } catch {
            // not JSON — fall through
        }
        return { content: '{}', inputTokens: 0, outputTokens: 0, cost: 0 };
    });
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
        mockBatchMqmPass();
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
                }),
            ]),
        );
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

        // callLlm 호출 순서: 1) 초기 batch MQM, 2) batch postprocess, 3) 최종 batch MQM
        let llmCallCount = 0;
        vi.spyOn(clientModule, 'callLlm').mockImplementation(async () => {
            llmCallCount++;
            if (llmCallCount === 1) {
                // 초기 batch MQM: component.description PASS, onClick FAIL
                return {
                    content: JSON.stringify({
                        evaluations: [
                            { id: 'component.description', verdict: 'PASS', errors: [] },
                            {
                                id: 'props[0].onClick.description',
                                verdict: 'FAIL',
                                errors: [initialError],
                            },
                        ],
                    }),
                    inputTokens: 0,
                    outputTokens: 0,
                    cost: 0,
                };
            }
            if (llmCallCount === 2) {
                // batch postprocess: 수정된 번역 반환
                return {
                    content: JSON.stringify({
                        translations: [
                            {
                                id: 'props[0].onClick.description',
                                translated: '수정되어도 검증 실패한 번역',
                            },
                        ],
                    }),
                    inputTokens: 0,
                    outputTokens: 0,
                    cost: 0,
                };
            }
            // 최종 batch MQM: onClick 여전히 FAIL
            return {
                content: JSON.stringify({
                    evaluations: [
                        {
                            id: 'props[0].onClick.description',
                            verdict: 'FAIL',
                            errors: [finalError],
                        },
                    ],
                }),
                inputTokens: 0,
                outputTokens: 0,
                cost: 0,
            };
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
        // batch MQM returns FAIL, batch postprocess returns invalid → fallback to unit lifecycle
        vi.spyOn(clientModule, 'callLlm').mockImplementation(async (messages) => {
            const userContent = messages.find((m) => m.role === 'user')?.content ?? '';
            try {
                const parsed = JSON.parse(userContent) as { units?: unknown[] };
                if (Array.isArray(parsed.units)) {
                    return {
                        content: JSON.stringify({
                            evaluations: [
                                {
                                    id: 'component.description',
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
                        }),
                        inputTokens: 0,
                        outputTokens: 0,
                        cost: 0,
                    };
                }
                // postprocess returns invalid JSON
                return { content: 'invalid', inputTokens: 0, outputTokens: 0, cost: 0 };
            } catch {
                return { content: '{}', inputTokens: 0, outputTokens: 0, cost: 0 };
            }
        });
        vi.spyOn(postprocessModule, 'postprocessWithLlm').mockResolvedValue({
            translated: 'Button 컴포넌트입니다.',
            invalid: true,
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

    it('falls back to the per-unit lifecycle when batch MQM response is invalid', async () => {
        vi.spyOn(clientModule, 'callLlm').mockResolvedValue({
            content: 'not-valid-json',
            inputTokens: 0,
            outputTokens: 0,
            cost: 0,
        });
        vi.spyOn(mqmModule, 'validateWithMqm').mockResolvedValue({ verdict: 'PASS', errors: [] });
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

    it('lets component B hit the cache produced earlier in the run by component A', async () => {
        const sharedSource = 'Click handler callback.';
        const propsWithSharedSource: TranslatableDoc[] = [
            { name: 'Button', props: [{ name: 'onClick', description: sharedSource }] },
            { name: 'IconButton', props: [{ name: 'onClick', description: sharedSource }] },
        ];

        vi.spyOn(cacheModule, 'loadCache').mockReturnValue(new Map());
        const translateSpy = vi
            .spyOn(translationModule, 'translateComponentUnits')
            .mockImplementation(async (_componentName, units) => {
                return new Map(units.map((unit) => [unit.id, '클릭 핸들러 콜백.']));
            });

        await translatePropsInfo(propsWithSharedSource, baseConfig, '/tmp/cache');

        expect(translateSpy).toHaveBeenCalledTimes(1);
        expect(translateSpy.mock.calls[0]?.[0]).toBe('Button');
    });

    it('saves cache once per component, not only at the end', async () => {
        const twoTranslatables: TranslatableDoc[] = [
            { name: 'A', description: 'first', props: [] },
            { name: 'B', description: 'second', props: [] },
        ];
        const saveCacheSpy = vi.spyOn(cacheModule, 'saveCache').mockImplementation(() => undefined);
        vi.spyOn(translationModule, 'translateComponentUnits').mockImplementation(
            async (_componentName, units) => new Map(units.map((unit) => [unit.id, '번역'])),
        );

        await translatePropsInfo(twoTranslatables, baseConfig, '/tmp/cache');

        expect(saveCacheSpy).toHaveBeenCalledTimes(2);
    });

    it('logs stage timings when verbose logging is enabled', async () => {
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

        await translatePropsInfo(sampleProps.slice(0, 1), baseConfig, '/tmp/cache', true);

        const logs = errorSpy.mock.calls.map(([message]) => String(message));
        expect(logs).toEqual(
            expect.arrayContaining([
                expect.stringMatching(/^\[i18n\] timing: collectTranslationUnits \d+ms$/),
                expect.stringMatching(/^\[i18n\] timing: loadCache \d+ms$/),
                expect.stringMatching(/^\[i18n\] cache \(Button\): \d+ hit, \d+ miss/),
                expect.stringMatching(/^\[i18n\] timing: translateComponentUnits Button \d+ms$/),
                expect.stringMatching(/^\[i18n\] timing: batchMqm Button \d+ms$/),
                expect.stringMatching(/^\[i18n\] timing: saveCache Button \d+ms$/),
                expect.stringMatching(/^\[i18n\] timing: applyTranslationOutcomes \d+ms$/),
                expect.stringMatching(/^\[i18n\] timing: buildComponentReports \d+ms$/),
                expect.stringMatching(/^\[i18n\] timing: translatePropsInfo total \d+ms$/),
            ]),
        );
    });
});
