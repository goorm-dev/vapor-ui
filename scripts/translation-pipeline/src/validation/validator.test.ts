import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { TranslationConfig } from '~/types';
import { validateWithMqm } from '~/validation/validator';

const baseConfig: TranslationConfig = {
    skipCache: false,
    targetLocale: 'ko',
    llm: {
        translationModel: 'claude-sonnet-4-6',
        validationModel: 'claude-opus-4-7',
        postprocessModel: 'claude-opus-4-7',
    },
};

describe('validateWithMqm', () => {
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

    it('uses JSON mode with the validation model', async () => {
        vi.mocked(fetch).mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                choices: [{ message: { content: '{"verdict":"PASS","errors":[]}' } }],
            }),
        } as Response);

        const result = await validateWithMqm('breadcrumb item', 'Breadcrumb 항목', baseConfig);

        expect(result).toEqual({ verdict: 'PASS', errors: [] });
        const body = JSON.parse(String(vi.mocked(fetch).mock.calls[0][1]?.body)) as {
            model: string;
            response_format?: { type: string };
            messages: { role: string; content: string }[];
        };
        expect(body.model).toBe('claude-opus-4-7');
        expect(body.response_format).toEqual({ type: 'json_object' });
        expect(body.messages[0].content).toContain('Terminology/');
        expect(body.messages[0].content).toContain('verdict');
    });

    it('logs LiteLLM usage and response cost metadata when provided', async () => {
        vi.mocked(fetch).mockResolvedValueOnce({
            ok: true,
            headers: new Headers({ 'x-litellm-response-cost': '0.0042' }),
            json: async () => ({
                model: 'claude-opus-4-7',
                choices: [{ message: { content: '{"verdict":"PASS","errors":[]}' } }],
                usage: { prompt_tokens: 300, completion_tokens: 40, total_tokens: 340 },
            }),
        } as Response);
        const log = vi.fn();

        await validateWithMqm(
            'breadcrumb item',
            'Breadcrumb 항목',
            baseConfig,
            log,
            'initialMqm component.description',
        );

        expect(log).toHaveBeenCalledWith(
            'llm: initialMqm component.description model=claude-opus-4-7 promptTokens=300 completionTokens=40 totalTokens=340 cost=$0.004200',
        );
    });

    it('valid FAIL response returns FAIL with errors', async () => {
        const failPayload = {
            verdict: 'FAIL',
            errors: [
                {
                    category: 'Terminology/Prop name mistranslated',
                    severity: 'critical',
                    source_span: 'onClick',
                    mt_span: '클릭',
                    explanation: 'identifier must not be translated',
                },
            ],
        };
        vi.mocked(fetch).mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                choices: [{ message: { content: JSON.stringify(failPayload) } }],
            }),
        } as Response);

        const result = await validateWithMqm('onClick handler', '클릭 handler', baseConfig);

        expect(result.verdict).toBe('FAIL');
        expect(result.errors).toHaveLength(1);
    });

    it('malformed response returns unavailable instead of PASS', async () => {
        vi.mocked(fetch).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ choices: [{ message: { content: 'not json' } }] }),
        } as Response);
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

        const result = await validateWithMqm('hello', '안녕', baseConfig);

        expect(result).toMatchObject({ verdict: 'FAIL', errors: [], unavailable: true });
        expect(warnSpy).toHaveBeenCalledOnce();
    });

    it('request failure returns unavailable instead of PASS', async () => {
        vi.mocked(fetch).mockResolvedValueOnce({ ok: false, status: 429 } as Response);
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

        const result = await validateWithMqm('hello', '안녕', baseConfig);

        expect(result).toMatchObject({ verdict: 'FAIL', errors: [], unavailable: true });
        expect(warnSpy).toHaveBeenCalledOnce();
    });
});
