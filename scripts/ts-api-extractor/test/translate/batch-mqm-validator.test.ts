import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { validateBatchWithMqm } from '~/translate/batch-mqm-validator';
import type { TranslationConfig, TranslationUnit } from '~/translate/types';

const config: TranslationConfig = {
    enabled: true,
    skipCache: false,
    targetLocale: 'ko',
    llm: {
        translationModel: 'claude-sonnet-4-6',
        validationModel: 'claude-opus-4-7',
        postprocessModel: 'claude-sonnet-4-6',
    },
    validation: { mqm: { enabled: true } },
};

const units: TranslationUnit[] = [
    {
        id: 'component.description',
        kind: 'component.description',
        ownerName: 'Button',
        source: 'A button component.',
        componentIndex: 0,
    },
    {
        id: 'props[0].size.description',
        kind: 'prop.description',
        ownerName: 'size',
        source: 'Controls the size.',
        componentIndex: 0,
        propIndex: 0,
    },
];

const translations = new Map([
    ['component.description', 'Button 컴포넌트입니다.'],
    ['props[0].size.description', '크기를 지정합니다.'],
]);

describe('validateBatchWithMqm', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn());
        vi.stubEnv('LITELLM_BASE_URL', 'https://litellm.internal');
        vi.stubEnv('LITELLM_API_KEY', 'test-key');
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.unstubAllEnvs();
        vi.restoreAllMocks();
    });

    it('returns id-keyed MQM evaluations from a valid batch response', async () => {
        vi.mocked(fetch).mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                choices: [
                    {
                        message: {
                            content: JSON.stringify({
                                evaluations: [
                                    { id: 'component.description', verdict: 'PASS', errors: [] },
                                    {
                                        id: 'props[0].size.description',
                                        verdict: 'FAIL',
                                        errors: [
                                            {
                                                category: 'Fluency/Unnatural phrasing',
                                                severity: 'minor',
                                                source_span: 'Controls',
                                                mt_span: '지정',
                                                explanation: '더 자연스러운 표현이 필요합니다.',
                                            },
                                        ],
                                    },
                                ],
                            }),
                        },
                    },
                ],
            }),
        } as Response);

        const result = await validateBatchWithMqm('Button', units, translations, config);

        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.evaluations.get('component.description')).toEqual({
                verdict: 'PASS',
                errors: [],
            });
            expect(result.evaluations.get('props[0].size.description')?.verdict).toBe('FAIL');
        }
    });

    it('returns invalid when the response omits an expected id', async () => {
        vi.mocked(fetch).mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                choices: [
                    {
                        message: {
                            content: JSON.stringify({
                                evaluations: [
                                    { id: 'component.description', verdict: 'PASS', errors: [] },
                                ],
                            }),
                        },
                    },
                ],
            }),
        } as Response);

        const result = await validateBatchWithMqm('Button', units, translations, config);

        expect(result).toMatchObject({
            ok: false,
            reason: 'Missing evaluation id: props[0].size.description',
        });
    });
});
