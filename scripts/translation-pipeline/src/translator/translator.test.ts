import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import * as cacheModule from '~/cache/cache';
import * as clientModule from '~/translation/client';
import * as translationModule from '~/translation/translate';
import { translatePropsInfo } from '~/translator/translator';
import type { TranslatableDoc } from '~/types';

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
        const cachedKey = cacheModule.makeCacheKey('Click handler callback.');
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

        const result = await translatePropsInfo(sampleProps, '/tmp/cache');

        expect(translateSpy).toHaveBeenCalledOnce();
        expect(translateSpy).toHaveBeenCalledWith('Button', [
            expect.objectContaining({
                id: 'component.description',
                source: 'A button component.',
            }),
        ]);
        expect(result.props[0].description).toBe('Button 컴포넌트입니다.');
        expect(result.props[0].props[0].description).toBe('캐시된 콜백 설명입니다.');
    });

    it('keeps components with zero translation units in the report summary', async () => {
        const result = await translatePropsInfo(sampleProps);

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

        await translatePropsInfo(sampleProps.slice(0, 1), '/tmp/cache');

        const savedStore = saveCacheSpy.mock.calls[0]?.[1];
        expect(savedStore?.size).toBe(1);
        expect(Array.from(savedStore?.values() ?? [])).toEqual([
            {
                source: 'A button component.',
                translated: 'Button 컴포넌트입니다.',
            },
        ]);
    });

    it('marks all units as degraded with batch_mqm_failed when batch MQM response is invalid', async () => {
        vi.spyOn(clientModule, 'callLlm').mockResolvedValue({
            content: 'not-valid-json',
        });
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

        const result = await translatePropsInfo([
            { name: 'Button', description: 'A button component.', props: [] },
        ]);

        expect(result.componentReports[0]).toMatchObject({
            verified: 0,
            unverified: 1,
        });
        expect(result.componentReports[0].unverifiedOutcomes[0]).toMatchObject({
            reason: 'batch_mqm_failed',
            assurance: 'unverified',
            reportable: true,
        });
        expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('batch failure summary'));
    });

    it('marks a chunk degraded when batch MQM omits an expected id', async () => {
        vi.spyOn(clientModule, 'callLlm').mockResolvedValue({
            content: JSON.stringify({
                evaluations: [{ id: 'component.description', verdict: 'PASS', errors: [] }],
            }),
        });
        vi.spyOn(console, 'warn').mockImplementation(() => undefined);

        const result = await translatePropsInfo(sampleProps.slice(0, 1));

        expect(result.componentReports[0]).toMatchObject({
            verified: 0,
            unverified: 2,
        });
        expect(result.batchFallbacks[0]?.reason).toContain(
            'Missing response id: props[0].onClick.description',
        );
    });

    it('marks failed units as degraded with batch_postprocess_failed when batch postprocess response is invalid', async () => {
        let llmCallCount = 0;
        vi.spyOn(clientModule, 'callLlm').mockImplementation(async () => {
            llmCallCount++;
            if (llmCallCount === 1) {
                // 초기 batch MQM: FAIL
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
                                        explanation: '부자연스럽습니다.',
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
            // batch postprocess: invalid JSON
            return { content: 'not-valid-json', inputTokens: 0, outputTokens: 0, cost: 0 };
        });
        vi.spyOn(console, 'warn').mockImplementation(() => undefined);

        const result = await translatePropsInfo([
            { name: 'Button', description: 'A button component.', props: [] },
        ]);

        expect(result.componentReports[0].unverifiedOutcomes[0]).toMatchObject({
            reason: 'batch_postprocess_failed',
            assurance: 'unverified',
            reportable: true,
        });
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

        await translatePropsInfo(propsWithSharedSource, '/tmp/cache');

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

        await translatePropsInfo(twoTranslatables, '/tmp/cache');

        expect(saveCacheSpy).toHaveBeenCalledTimes(2);
    });
});
