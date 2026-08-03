import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import * as cacheModule from '~/cache';
import * as clientModule from '~/client';
import { type TranslatableDoc, getTranslationUnitKey } from '~/domain';
import * as translationModule from '~/translate';
import { translateDescriptions } from '~/translator';

const sampleProps: TranslatableDoc[] = [
    {
        name: 'Button',
        displayName: 'Button',
        description: 'A button component.',
        props: [{ name: 'onClick', description: 'Click handler callback.' }],
    },
    {
        name: 'Divider',
        displayName: 'Divider',
        props: [],
    },
];

function mockTranslations(translations: Record<string, string>): void {
    vi.spyOn(translationModule, 'translateUnits').mockImplementation(async (units) => {
        return new Map(
            units.map((unit) => [
                getTranslationUnitKey(unit),
                translations[getTranslationUnitKey(unit)] ?? unit.source,
            ]),
        );
    });
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
                return { content: JSON.stringify({ evaluations }) };
            }
        } catch {
            // not JSON — fall through
        }
        return { content: '{}' };
    });
}

describe('translateDescriptions', () => {
    beforeEach(() => {
        vi.spyOn(cacheModule, 'loadCache').mockReturnValue(new Map());
        vi.spyOn(cacheModule, 'saveCache').mockImplementation(() => undefined);
        mockTranslations({
            'Button:(description)': 'Button 컴포넌트입니다.',
            'Button:onClick': '클릭 handler callback입니다.',
        });
        mockBatchMqmPass();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('returns a translations dictionary keyed by component identity and prop name', async () => {
        const result = await translateDescriptions(sampleProps);

        expect([...result.translations.keys()].sort()).toEqual([
            'Button:(description)',
            'Button:onClick',
        ]);
        expect(result.translations.get('Button:(description)')).toBe('Button 컴포넌트입니다.');
        expect(result.translations.get('Button:onClick')).toBe('클릭 handler callback입니다.');
    });

    it('throws instead of silently overwriting when two units share a key', async () => {
        const collidingDocs: TranslatableDoc[] = [
            {
                name: 'Root',
                displayName: 'Select.Root',
                props: [{ name: 'size', description: 'a' }],
            },
            {
                name: 'Root',
                displayName: 'Select.Root',
                props: [{ name: 'size', description: 'b' }],
            },
        ];

        await expect(translateDescriptions(collidingDocs)).rejects.toThrow(
            /Duplicate translation unit key: Select\.Root:size/,
        );
    });

    it('translates only cache misses, in a single cross-component batch', async () => {
        const cachedKey = cacheModule.makeCacheKey('Click handler callback.');
        vi.spyOn(cacheModule, 'loadCache').mockReturnValue(
            new Map([[cachedKey, '캐시된 콜백 설명입니다.']]),
        );
        const translateSpy = vi.spyOn(translationModule, 'translateUnits');

        const result = await translateDescriptions(sampleProps, '/tmp/cache');

        expect(translateSpy).toHaveBeenCalledOnce();
        expect(translateSpy).toHaveBeenCalledWith([
            expect.objectContaining({
                kind: 'component.description',
                source: 'A button component.',
                componentDisplayName: 'Button',
            }),
        ]);
        expect(result.translations.get('Button:(description)')).toBe('Button 컴포넌트입니다.');
        expect(result.translations.get('Button:onClick')).toBe('캐시된 콜백 설명입니다.');
    });

    it('keeps components with zero translation units in the report summary', async () => {
        const result = await translateDescriptions(sampleProps);

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
                            { id: 'Button:(description)', verdict: 'PASS', errors: [] },
                            {
                                id: 'Button:onClick',
                                verdict: 'FAIL',
                                errors: [initialError],
                            },
                        ],
                    }),
                };
            }
            if (llmCallCount === 2) {
                return {
                    content: JSON.stringify({
                        translations: [
                            {
                                id: 'Button:onClick',
                                translated: '수정되어도 검증 실패한 번역',
                            },
                        ],
                    }),
                };
            }
            return {
                content: JSON.stringify({
                    evaluations: [
                        {
                            id: 'Button:onClick',
                            verdict: 'FAIL',
                            errors: [finalError],
                        },
                    ],
                }),
            };
        });

        await translateDescriptions(sampleProps.slice(0, 1), '/tmp/cache');

        const savedStore = saveCacheSpy.mock.calls[0]?.[1];
        expect(savedStore?.size).toBe(1);
        expect(Array.from(savedStore?.values() ?? [])).toEqual(['Button 컴포넌트입니다.']);
    });

    it('marks all units as degraded with batch_mqm_failed when batch MQM response is invalid', async () => {
        vi.spyOn(clientModule, 'callLlm').mockResolvedValue({
            content: 'not-valid-json',
        });
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

        const result = await translateDescriptions([
            {
                name: 'Button',
                displayName: 'Button',
                description: 'A button component.',
                props: [],
            },
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
                evaluations: [{ id: 'Button:(description)', verdict: 'PASS', errors: [] }],
            }),
        });
        vi.spyOn(console, 'warn').mockImplementation(() => undefined);

        const result = await translateDescriptions(sampleProps.slice(0, 1));

        expect(result.componentReports[0]).toMatchObject({
            verified: 0,
            unverified: 2,
        });
        expect(result.batchFallbacks[0]).toContain('Missing response id: Button:onClick');
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
                                id: 'Button:(description)',
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
                };
            }
            // batch postprocess: invalid JSON
            return { content: 'not-valid-json' };
        });
        vi.spyOn(console, 'warn').mockImplementation(() => undefined);

        const result = await translateDescriptions([
            {
                name: 'Button',
                displayName: 'Button',
                description: 'A button component.',
                props: [],
            },
        ]);

        expect(result.componentReports[0].unverifiedOutcomes[0]).toMatchObject({
            reason: 'batch_postprocess_failed',
            assurance: 'unverified',
            reportable: true,
        });
    });

    it('translates a source shared by two components exactly once', async () => {
        const sharedSource = 'Click handler callback.';
        const propsWithSharedSource: TranslatableDoc[] = [
            {
                name: 'Button',
                displayName: 'Button',
                props: [{ name: 'onClick', description: sharedSource }],
            },
            {
                name: 'IconButton',
                displayName: 'IconButton',
                props: [{ name: 'onClick', description: sharedSource }],
            },
        ];

        const translateSpy = vi
            .spyOn(translationModule, 'translateUnits')
            .mockImplementation(async (units) => {
                return new Map(
                    units.map((unit) => [getTranslationUnitKey(unit), '클릭 핸들러 콜백.']),
                );
            });

        const result = await translateDescriptions(propsWithSharedSource, '/tmp/cache');

        expect(translateSpy).toHaveBeenCalledOnce();
        expect(translateSpy.mock.calls[0]?.[0]).toHaveLength(1);
        expect(result.translations.get('Button:onClick')).toBe('클릭 핸들러 콜백.');
        expect(result.translations.get('IconButton:onClick')).toBe('클릭 핸들러 콜백.');
    });

    it('saves the cache once per run, after the MQM phase', async () => {
        const twoTranslatables: TranslatableDoc[] = [
            { name: 'A', displayName: 'A', description: 'first', props: [] },
            { name: 'B', displayName: 'B', description: 'second', props: [] },
        ];
        const saveCacheSpy = vi.spyOn(cacheModule, 'saveCache').mockImplementation(() => undefined);
        vi.spyOn(translationModule, 'translateUnits').mockImplementation(
            async (units) => new Map(units.map((unit) => [getTranslationUnitKey(unit), '번역'])),
        );

        await translateDescriptions(twoTranslatables, '/tmp/cache');

        expect(saveCacheSpy).toHaveBeenCalledOnce();
        expect(saveCacheSpy.mock.calls[0]?.[1].size).toBe(2);
    });

    it('falls back to English when post-editing cannot restore a dropped code span', async () => {
        const props: TranslatableDoc[] = [
            {
                name: 'Button',
                displayName: 'Button',
                description: 'Renders a `<button>` element.',
                props: [],
            },
        ];
        mockTranslations({ 'Button:(description)': '버튼 요소를 렌더링합니다.' });
        // MQM은 PASS를 주지만 결정론 체크가 코드 스팬 누락을 잡고, 후편집도 복구하지 못한다.
        vi.spyOn(clientModule, 'callLlm').mockImplementation(async (messages) => {
            const content = messages.find((m) => m.role === 'user')?.content ?? '';
            const parsed = JSON.parse(content) as { units: { id: string }[] };
            if (content.includes('initialTranslation')) {
                return {
                    content: JSON.stringify({
                        translations: parsed.units.map(({ id }) => ({
                            id,
                            translated: '여전히 코드 스팬이 없습니다.',
                        })),
                    }),
                };
            }
            return {
                content: JSON.stringify({
                    evaluations: parsed.units.map(({ id }) => ({
                        id,
                        verdict: 'PASS',
                        errors: [],
                    })),
                }),
            };
        });
        vi.spyOn(console, 'warn').mockImplementation(() => undefined);

        const result = await translateDescriptions(props, '/tmp/cache');

        expect(result.translations.get('Button:(description)')).toBe(
            'Renders a `<button>` element.',
        );
        expect(result.componentReports[0].unverifiedOutcomes[0]).toMatchObject({
            reason: 'preservation_fallback',
            assurance: 'unverified',
            violations: [{ rule: 'backtick_span', expected: '`<button>`' }],
        });
    });

    it('falls back to English when a translation batch throws', async () => {
        vi.spyOn(translationModule, 'translateUnits').mockRejectedValue(new Error('gateway down'));
        vi.spyOn(console, 'warn').mockImplementation(() => undefined);

        const result = await translateDescriptions(sampleProps.slice(0, 1), '/tmp/cache');

        expect(result.translations.get('Button:(description)')).toBe('A button component.');
        expect(result.componentReports[0].unverifiedOutcomes).toEqual(
            expect.arrayContaining([expect.objectContaining({ reason: 'translation_failed' })]),
        );
        expect(result.batchFallbacks[0]).toContain('gateway down');
    });
});
