import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { postprocessBatchWithLlm } from '~/translate/batch-postprocess';
import type { MqmError, TranslationUnit } from '~/translate/types';

const unit: TranslationUnit = {
    id: 'component.description',
    kind: 'component.description',
    ownerName: 'Button',
    source: 'A button component.',
    componentIndex: 0,
};

const errors: MqmError[] = [
    {
        category: 'Fluency/Unnatural phrasing',
        severity: 'minor',
        source_span: 'button component',
        mt_span: '버튼 구성 요소',
        explanation: '컴포넌트 문맥에 맞는 표현이 필요합니다.',
    },
];

describe('postprocessBatchWithLlm', () => {
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

    it('returns id-keyed translations for failed units only', async () => {
        vi.mocked(fetch).mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                choices: [
                    {
                        message: {
                            content: JSON.stringify({
                                translations: [
                                    {
                                        id: 'component.description',
                                        translated: 'Button 컴포넌트입니다.',
                                    },
                                ],
                            }),
                        },
                    },
                ],
            }),
        } as Response);

        const result = await postprocessBatchWithLlm(
            'Button',
            [{ unit, initialTranslation: 'Button 구성 요소입니다.', errors }],
            'claude-sonnet-4-6',
        );

        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.translations).toEqual(
                new Map([['component.description', 'Button 컴포넌트입니다.']]),
            );
        }
    });

    it('returns invalid for empty translated text', async () => {
        vi.mocked(fetch).mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                choices: [
                    {
                        message: {
                            content: JSON.stringify({
                                translations: [{ id: 'component.description', translated: '' }],
                            }),
                        },
                    },
                ],
            }),
        } as Response);

        const result = await postprocessBatchWithLlm(
            'Button',
            [{ unit, initialTranslation: 'Button 구성 요소입니다.', errors }],
            'claude-sonnet-4-6',
        );

        expect(result).toMatchObject({
            ok: false,
            reason: 'Empty translation for id: component.description',
        });
    });
});
