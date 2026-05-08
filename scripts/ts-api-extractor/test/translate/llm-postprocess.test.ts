import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { postprocessWithLlm } from '~/translate/llm-postprocess';

describe('postprocessWithLlm', () => {
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

    it('uses JSON mode and returns the translated field', async () => {
        vi.mocked(fetch).mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                choices: [{ message: { content: '{"translated":"수정된 번역"}' } }],
            }),
        } as Response);

        const result = await postprocessWithLlm('hello', '안녕 draft', [], 'claude-sonnet-4-6');

        expect(result).toEqual({ translated: '수정된 번역' });
        const body = JSON.parse(String(vi.mocked(fetch).mock.calls[0][1]?.body)) as {
            model: string;
            response_format?: { type: string };
        };
        expect(body.model).toBe('claude-sonnet-4-6');
        expect(body.response_format).toEqual({ type: 'json_object' });
    });

    it('parses JSON responses wrapped in markdown code fences', async () => {
        vi.mocked(fetch).mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                choices: [
                    {
                        message: {
                            content: '```json\n{"translated":"수정된 번역"}\n```',
                        },
                    },
                ],
            }),
        } as Response);

        const result = await postprocessWithLlm('hello', '안녕 draft');

        expect(result).toEqual({ translated: '수정된 번역' });
    });

    it('invalid JSON response returns the initial draft and marks invalid', async () => {
        vi.mocked(fetch).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ choices: [{ message: { content: 'plain text' } }] }),
        } as Response);
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

        const result = await postprocessWithLlm('hello', '안녕 draft');

        expect(result).toEqual({ translated: '안녕 draft', invalid: true });
        expect(warnSpy).toHaveBeenCalledOnce();
    });

    it('request failure returns the initial draft and marks invalid', async () => {
        vi.mocked(fetch).mockResolvedValueOnce({ ok: false, status: 500 } as Response);
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

        const result = await postprocessWithLlm('hello', '안녕 draft');

        expect(result).toEqual({ translated: '안녕 draft', invalid: true });
        expect(warnSpy).toHaveBeenCalledOnce();
    });

    it('includes MQM error feedback in the request body', async () => {
        vi.mocked(fetch).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ choices: [{ message: { content: '{"translated":"수정"}' } }] }),
        } as Response);

        await postprocessWithLlm('onClick handler', '클릭 핸들러', [
            {
                category: 'Terminology/Prop name mistranslated',
                severity: 'major',
                source_span: 'onClick',
                mt_span: '클릭',
                explanation: 'must not be translated',
            },
        ]);

        const body = JSON.parse(String(vi.mocked(fetch).mock.calls[0][1]?.body)) as {
            messages: { role: string; content: string }[];
        };
        const userMessage = body.messages.find((m) => m.role === 'user');
        expect(userMessage?.content).toContain('MQM errors to fix');
        expect(userMessage?.content).toContain('onClick');
        expect(userMessage?.content).toContain('클릭');
        expect(userMessage?.content).toContain('must not be translated');
    });
});
