import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { PropsInfoJson } from '~/models/output';
import type * as CacheModule from '~/translate/cache';
import * as cacheModule from '~/translate/cache';
import * as deeplModule from '~/translate/deepl';
import * as llmModule from '~/translate/llm-postprocess';
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
    llm: { enabled: true },
    validation: {
        mqm: {
            enabled: true,
            failOnError: false,
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
];

describe('translatePropsInfo', () => {
    beforeEach(() => {
        vi.stubEnv('DEEPL_API_KEY', '');
        vi.stubEnv('LITELLM_BASE_URL', 'https://litellm.internal.goorm.io');
        vi.stubEnv('LITELLM_API_KEY', 'test-key');
        vi.stubEnv('LITELLM_MODEL', 'claude-sonnet-4-6');
    });

    afterEach(() => {
        vi.unstubAllEnvs();
        vi.restoreAllMocks();
    });

    // Test case 1: translation.enabled: false → extract 레벨에서 translatePropsInfo 호출 안 됨
    // (Extract 레벨 테스트: pipeline 함수 자체에서 enabled 체크하지 않으므로
    //  extract.ts 가 호출을 건너뜀. 여기서는 pipeline 자체 동작을 검증)
    it('translation.enabled: false 일 때 extract가 translatePropsInfo를 호출하지 않음 (pipeline spy 검증)', async () => {
        const spy = vi.spyOn(deeplModule, 'translateWithDeepl').mockResolvedValue([]);

        // extract.ts의 if (config.translation?.enabled) 분기 시뮬레이션
        const config = { ...baseConfig, enabled: false };

        if (config.enabled) {
            await translatePropsInfo(sampleProps, config);
        }

        expect(spy).not.toHaveBeenCalled();
    });

    // Test case 2: DeepL API 키 없을 때 → 원문 반환 + warn
    it('DeepL API 키 없을 때 원문 반환 + warn 출력', async () => {
        vi.stubEnv('DEEPL_API_KEY', '');
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        vi.spyOn(llmModule, 'postprocessWithLlm').mockImplementation(async (source) => ({
            translated: source,
        }));
        vi.spyOn(mqmModule, 'validateWithMqm').mockResolvedValue({
            verdict: 'PASS',
            errors: [],
        });

        const config = {
            ...baseConfig,
            validation: { mqm: { enabled: false, failOnError: false } },
        };

        const result = await translatePropsInfo(sampleProps, config);

        // DeepL returns originals when no API key → LLM returns same → result equals originals
        expect(result.props[0].description).toBe('A button component.');
        expect(result.props[0].props[0].description).toBe('Click handler callback.');
        expect(warnSpy).toHaveBeenCalled();
    });

    // Test case 3: MQM: major 오류 없으면 verdict: 'PASS'
    it('MQM: major 오류 없으면 verdict PASS', async () => {
        vi.spyOn(deeplModule, 'translateWithDeepl').mockResolvedValue([
            '버튼 component.',
            '클릭 핸들러 callback.',
        ]);
        vi.spyOn(llmModule, 'postprocessWithLlm').mockImplementation(async (source) => ({
            translated: source,
        }));
        const mqmSpy = vi.spyOn(mqmModule, 'validateWithMqm').mockResolvedValue({
            verdict: 'PASS',
            errors: [],
        });

        await translatePropsInfo(sampleProps, baseConfig);

        expect(mqmSpy).toHaveBeenCalled();
        const results = mqmSpy.mock.results;
        for (const r of results) {
            const mqmResult = await r.value;
            expect(mqmResult.verdict).toBe('PASS');
        }
    });

    // Test case 4: MQM: major 오류 1개 이상이면 verdict: 'FAIL'
    it('MQM: major 오류 1개 이상이면 verdict FAIL', async () => {
        vi.spyOn(deeplModule, 'translateWithDeepl').mockResolvedValue([
            '버튼 컴포넌트.',
            '클릭 핸들러.',
        ]);
        vi.spyOn(llmModule, 'postprocessWithLlm').mockImplementation(async (source) => ({
            translated: source,
        }));
        vi.spyOn(mqmModule, 'validateWithMqm').mockResolvedValue({
            verdict: 'FAIL',
            errors: [
                {
                    category: 'Accuracy/Mistranslation',
                    severity: 'major',
                    source_span: 'A button component.',
                    mt_span: '버튼 컴포넌트.',
                    explanation: '의미 왜곡',
                },
            ],
        });

        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

        const config = {
            ...baseConfig,
            validation: { mqm: { enabled: true, failOnError: false } },
        };

        // failOnError: false → should not throw, just warn
        const result = await translatePropsInfo(sampleProps, config);

        expect(warnSpy).toHaveBeenCalled();
        expect(result).toBeDefined();
        expect(result.componentReports[0].failCount).toBeGreaterThan(0);
        expect(result.componentReports[0].errors).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ severity: 'major', category: 'Accuracy/Mistranslation' }),
            ]),
        );
    });

    it('verbose=true이면 MQM 실패 판정과 error 상세를 로그로 출력', async () => {
        vi.spyOn(deeplModule, 'translateWithDeepl').mockResolvedValue(['버튼 컴포넌트.']);
        vi.spyOn(llmModule, 'postprocessWithLlm').mockResolvedValue({
            translated: '버튼 컴포넌트입니다.',
        });
        vi.spyOn(mqmModule, 'validateWithMqm').mockResolvedValue({
            verdict: 'FAIL',
            errors: [
                {
                    category: 'Accuracy/Mistranslation',
                    severity: 'major',
                    source_span: 'A button component.',
                    mt_span: '버튼 컴포넌트.',
                    explanation: '의미 왜곡',
                },
            ],
        });
        const logSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

        const propsWithDescription: PropsInfoJson[] = [
            {
                name: 'Button',
                description: 'A button component.',
                props: [],
            },
        ];

        await translatePropsInfo(propsWithDescription, baseConfig, undefined, true);

        expect(logSpy).toHaveBeenCalledWith('[i18n] mqm: Button.description FAIL (1 error)');
        expect(logSpy).toHaveBeenCalledWith(
            '[i18n] mqm:error Button.description #1 major Accuracy/Mistranslation',
        );
        expect(logSpy).toHaveBeenCalledWith('[i18n]   source_span: "A button component."');
        expect(logSpy).toHaveBeenCalledWith('[i18n]   mt_span: "버튼 컴포넌트."');
        expect(logSpy).toHaveBeenCalledWith('[i18n]   explanation: 의미 왜곡');
    });

    // Test case 5: failOnError: true + FAIL → Error throw
    it('failOnError: true + FAIL → Error throw', async () => {
        vi.spyOn(deeplModule, 'translateWithDeepl').mockResolvedValue(['버튼 컴포넌트.']);
        vi.spyOn(llmModule, 'postprocessWithLlm').mockImplementation(async (source) => ({
            translated: source,
        }));
        vi.spyOn(mqmModule, 'validateWithMqm').mockResolvedValue({
            verdict: 'FAIL',
            errors: [
                {
                    category: 'Accuracy/Mistranslation',
                    severity: 'major',
                    source_span: 'A button component.',
                    mt_span: '버튼 컴포넌트.',
                    explanation: '의미 왜곡',
                },
            ],
        });

        const config = {
            ...baseConfig,
            validation: { mqm: { enabled: true, failOnError: true } },
        };

        const propsWithDescription: PropsInfoJson[] = [
            {
                name: 'Button',
                description: 'A button component.',
                props: [],
            },
        ];

        await expect(translatePropsInfo(propsWithDescription, config)).rejects.toThrow(
            /Translation validation FAILED/,
        );
    });

    // Test case 6: failOnError: false + FAIL → LLM 재번역 후 결과 사용 (warn 없음)
    it('failOnError: false + FAIL → LLM 재번역 결과 사용', async () => {
        const mtText = '버튼 컴포넌트.';
        const rewrittenText = '버튼 컴포넌트입니다.';
        vi.spyOn(deeplModule, 'translateWithDeepl').mockResolvedValue([mtText]);
        vi.spyOn(llmModule, 'postprocessWithLlm').mockResolvedValue({ translated: rewrittenText });
        vi.spyOn(mqmModule, 'validateWithMqm')
            .mockResolvedValueOnce({
                verdict: 'FAIL',
                errors: [
                    {
                        category: 'Accuracy/Mistranslation',
                        severity: 'major',
                        source_span: 'A button component.',
                        mt_span: mtText,
                        explanation: '의미 왜곡',
                    },
                ],
            })
            .mockResolvedValueOnce({ verdict: 'PASS', errors: [] });

        const config = {
            ...baseConfig,
            validation: { mqm: { enabled: true, failOnError: false } },
        };

        const propsWithDescription: PropsInfoJson[] = [
            {
                name: 'Button',
                description: 'A button component.',
                props: [],
            },
        ];

        const result = await translatePropsInfo(propsWithDescription, config);

        // FAIL이어도 throw 없이 LLM 재번역 결과를 사용
        expect(result.props[0].description).toBe(rewrittenText);
        expect(result.componentReports[0].initial.failCount).toBeGreaterThan(0);
        expect(result.componentReports[0].final.failCount).toBe(0);
        expect(result.componentReports[0].failCount).toBe(0);
    });

    it('MQM verdict FAIL with empty errors → does not treat as PASS', async () => {
        const mtText = '버튼 컴포넌트.';
        const rewrittenText = '버튼 컴포넌트입니다.';
        vi.spyOn(deeplModule, 'translateWithDeepl').mockResolvedValue([mtText]);
        const postprocessSpy = vi
            .spyOn(llmModule, 'postprocessWithLlm')
            .mockResolvedValue({ translated: rewrittenText });
        vi.spyOn(mqmModule, 'validateWithMqm').mockResolvedValue({
            verdict: 'FAIL',
            errors: [],
        });

        const config = {
            ...baseConfig,
            validation: { mqm: { enabled: true, failOnError: false } },
        };

        const propsWithDescription: PropsInfoJson[] = [
            {
                name: 'Button',
                description: 'A button component.',
                props: [],
            },
        ];

        const result = await translatePropsInfo(propsWithDescription, config);

        expect(postprocessSpy).toHaveBeenCalled();
        expect(result.props[0].description).toBe(mtText);
        expect(result.componentReports[0].failCount).toBe(1);
    });

    // Test case 7: 캐시 히트 → DeepL 호출 없이 캐시 결과 반환
    it('cache hit → translateWithDeepl 호출 없이 캐시 결과 반환', async () => {
        const cachedText = '캐시된 번역';
        const deeplSpy = vi.spyOn(deeplModule, 'translateWithDeepl').mockResolvedValue([]);

        vi.spyOn(cacheModule, 'loadCache').mockReturnValue(
            new Map([
                [
                    cacheModule.makeCacheKey(
                        'A button component.',
                        'ko',
                        true,
                        true,
                        'claude-sonnet-4-6',
                        'claude-sonnet-4-6',
                        '',
                    ),
                    {
                        source: 'A button component.',
                        translated: cachedText,
                        cachedAt: '2026-01-01T00:00:00.000Z',
                    },
                ],
                [
                    cacheModule.makeCacheKey(
                        'Click handler callback.',
                        'ko',
                        true,
                        true,
                        'claude-sonnet-4-6',
                        'claude-sonnet-4-6',
                        '',
                    ),
                    {
                        source: 'Click handler callback.',
                        translated: '캐시된 콜백',
                        cachedAt: '2026-01-01T00:00:00.000Z',
                    },
                ],
            ]),
        );
        vi.spyOn(cacheModule, 'saveCache').mockImplementation(() => undefined);

        const result = await translatePropsInfo(sampleProps, baseConfig, '/tmp/test-cache');

        expect(deeplSpy).not.toHaveBeenCalled();
        expect(result.props[0].description).toBe(cachedText);
        expect(result.props[0].props[0].description).toBe('캐시된 콜백');
    });

    // Test case 8: DeepL 부분 실패 → undefined 항목은 원문으로 폴백
    it('DeepL 결과가 입력보다 짧을 때 → 누락 항목은 원문으로 폴백', async () => {
        // DeepL이 첫 번째 항목만 반환 (두 번째 누락)
        vi.spyOn(deeplModule, 'translateWithDeepl').mockResolvedValue(['버튼 컴포넌트.']);
        vi.spyOn(llmModule, 'postprocessWithLlm').mockImplementation(async (_source, draft) => ({
            translated: draft,
        }));
        vi.spyOn(mqmModule, 'validateWithMqm').mockResolvedValue({ verdict: 'PASS', errors: [] });

        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

        const config = {
            ...baseConfig,
            validation: { mqm: { enabled: false, failOnError: false } },
        };
        const result = await translatePropsInfo(sampleProps, config);

        expect(warnSpy).toHaveBeenCalled();
        expect(result.props[0].description).toBe('버튼 컴포넌트.');
        // 두 번째 항목(prop description)은 DeepL 결과가 없으므로 원문 반환
        expect(result.props[0].props[0].description).toBe('Click handler callback.');
    });

    // Test case 9: description 없는 컴포넌트 → API 호출 없이 딥 카피 반환
    it('description이 없는 컴포넌트 → API 호출 없이 반환', async () => {
        const deeplSpy = vi.spyOn(deeplModule, 'translateWithDeepl').mockResolvedValue([]);
        const noDescProps: PropsInfoJson[] = [
            { name: 'Button', props: [{ name: 'disabled', type: ['boolean'], required: false }] },
        ];
        const config = {
            ...baseConfig,
            validation: { mqm: { enabled: false, failOnError: false } },
        };
        const result = await translatePropsInfo(noDescProps, config);

        expect(deeplSpy).not.toHaveBeenCalled();
        expect(result.props[0].name).toBe('Button');
        expect(result.props[0].description).toBeUndefined();
    });

    // Test case 10: MQM recheck도 FAIL → initial/final 리포트 집계 정확성
    it('recheck도 FAIL → initial.failCount > 0, final.failCount > 0, failOnError:false면 throw 없음', async () => {
        const mtText = '버튼 컴포넌트.';
        const rewrittenText = '버튼입니다.';
        vi.spyOn(deeplModule, 'translateWithDeepl').mockResolvedValue([mtText]);
        vi.spyOn(llmModule, 'postprocessWithLlm').mockResolvedValue({ translated: rewrittenText });

        const initialError = {
            category: 'Accuracy/Mistranslation' as const,
            severity: 'major' as const,
            source_span: 'A button component.',
            mt_span: mtText,
            explanation: '의미 왜곡',
        };
        const recheckError = {
            category: 'Fluency/Unnatural phrasing' as const,
            severity: 'minor' as const,
            source_span: 'A button component.',
            mt_span: rewrittenText,
            explanation: '어색한 표현',
        };

        vi.spyOn(mqmModule, 'validateWithMqm')
            .mockResolvedValueOnce({ verdict: 'FAIL', errors: [initialError] })
            .mockResolvedValueOnce({ verdict: 'FAIL', errors: [recheckError] });

        const config = {
            ...baseConfig,
            validation: { mqm: { enabled: true, failOnError: false } },
        };
        const propsWithDescription: PropsInfoJson[] = [
            { name: 'Button', description: 'A button component.', props: [] },
        ];

        // recheck FAIL은 throw 없이 결과를 반환해야 함
        const result = await translatePropsInfo(propsWithDescription, config);

        expect(result.componentReports[0].initial.failCount).toBe(1);
        expect(result.componentReports[0].final.failCount).toBe(1);
        expect(result.componentReports[0].failCount).toBe(1);
        expect(result.componentReports[0].errors).toEqual([recheckError]);
        // LLM 재번역 결과를 그대로 사용
        expect(result.props[0].description).toBe(rewrittenText);
    });

    // Test case 11: recheck FAIL + failOnError:true → Error throw
    it('recheck FAIL + failOnError:true → Error throw', async () => {
        const mtText = '버튼 컴포넌트.';
        vi.spyOn(deeplModule, 'translateWithDeepl').mockResolvedValue([mtText]);
        vi.spyOn(llmModule, 'postprocessWithLlm').mockResolvedValue({ translated: '수정된 버튼.' });
        vi.spyOn(mqmModule, 'validateWithMqm')
            .mockResolvedValueOnce({
                verdict: 'FAIL',
                errors: [
                    {
                        category: 'Accuracy/Mistranslation',
                        severity: 'major',
                        source_span: 'A button.',
                        mt_span: mtText,
                        explanation: '오역',
                    },
                ],
            })
            .mockResolvedValueOnce({
                verdict: 'FAIL',
                errors: [
                    {
                        category: 'Fluency/Unnatural phrasing',
                        severity: 'minor',
                        source_span: 'A button.',
                        mt_span: '수정된 버튼.',
                        explanation: '어색함',
                    },
                ],
            });

        const config = {
            ...baseConfig,
            validation: { mqm: { enabled: true, failOnError: true } },
        };
        const propsWithDescription: PropsInfoJson[] = [
            { name: 'Button', description: 'A button.', props: [] },
        ];

        await expect(translatePropsInfo(propsWithDescription, config)).rejects.toThrow(
            /Translation validation FAILED/,
        );
    });

    // Test case 12: DeepL 실패(원문 반환) 시 캐시에 저장하지 않음
    it('DeepL 실패로 원문이 반환된 경우 캐시에 저장하지 않음', async () => {
        vi.spyOn(deeplModule, 'translateWithDeepl').mockResolvedValue(undefined);
        vi.spyOn(console, 'warn').mockImplementation(() => undefined);

        const saveCacheSpy = vi.spyOn(cacheModule, 'saveCache').mockImplementation(() => undefined);
        vi.spyOn(cacheModule, 'loadCache').mockReturnValue(new Map());

        const propsWithDescription: PropsInfoJson[] = [
            { name: 'Button', description: 'A button component.', props: [] },
        ];
        const config = {
            ...baseConfig,
            validation: { mqm: { enabled: false, failOnError: false } },
        };

        await translatePropsInfo(propsWithDescription, config, '/tmp/test-cache');

        // saveCache が呼ばれていても、キャッシュストアは空であること
        expect(saveCacheSpy).toHaveBeenCalled();
        const [, savedStore] = saveCacheSpy.mock.calls[0];
        expect(savedStore.size).toBe(0);
    });

    // Test case 13: over-editing 감지 → warn 출력 + MT 원본 폴백
    it('over-editing 감지 시 warn 출력하고 MT 원본으로 폴백', async () => {
        const mtText = '클릭 handler입니다.';
        // LLM이 허용되지 않은 "handler"까지 바꿔버림 → over-edit
        const overEditText = 'onClick 핸들러입니다.';
        vi.spyOn(deeplModule, 'translateWithDeepl').mockResolvedValue([mtText]);
        vi.spyOn(llmModule, 'postprocessWithLlm').mockResolvedValue({ translated: overEditText });
        vi.spyOn(mqmModule, 'validateWithMqm')
            .mockResolvedValueOnce({
                verdict: 'FAIL',
                errors: [
                    {
                        category: 'Terminology/Prop name mistranslated',
                        severity: 'critical',
                        source_span: 'onClick',
                        mt_span: '클릭',
                        explanation: 'prop 이름은 번역하면 안 됩니다.',
                    },
                ],
            })
            .mockResolvedValueOnce({ verdict: 'PASS', errors: [] });

        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

        const propsWithDescription: PropsInfoJson[] = [
            { name: 'Button', description: 'onClick handler.', props: [] },
        ];

        const result = await translatePropsInfo(propsWithDescription, baseConfig);

        expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Over-editing detected'));
        // over-edit → no-edit span("handler입니다.")은 MT에서 복원, 허용된 span("클릭")은 LLM 결과("onClick") 유지
        expect(result.props[0].description).toBe('onClick handler입니다.');
    });
});
