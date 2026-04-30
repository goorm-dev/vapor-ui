import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { postprocessWithLlm } from '~/translate/llm-postprocess';

describe('postprocessWithLlm', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn());
        vi.stubEnv('LITELLM_BASE_URL', 'https://litellm.internal');
        vi.stubEnv('LITELLM_API_KEY', 'test-key');
        vi.stubEnv('LITELLM_MODEL', 'claude-sonnet-4-6');
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.unstubAllEnvs();
        vi.restoreAllMocks();
    });

    it('no LITELLM_BASE_URL → returns DeepL draft + console.warn', async () => {
        vi.stubEnv('LITELLM_BASE_URL', '');
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const result = await postprocessWithLlm('hello', '안녕 draft');
        expect(result).toBe('안녕 draft');
        expect(fetch).not.toHaveBeenCalled();
        expect(warnSpy).toHaveBeenCalledOnce();
    });

    it('fetch throws network error → returns DeepL draft + console.warn', async () => {
        vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const result = await postprocessWithLlm('hello', '안녕 draft');
        expect(result).toBe('안녕 draft');
        expect(warnSpy).toHaveBeenCalledOnce();
    });

    it('fetch returns non-ok status → returns DeepL draft + console.warn', async () => {
        vi.mocked(fetch).mockResolvedValueOnce({ ok: false, status: 500 } as Response);
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const result = await postprocessWithLlm('hello', '안녕 draft');
        expect(result).toBe('안녕 draft');
        expect(warnSpy).toHaveBeenCalledOnce();
    });

    it('success case → returns LLM-corrected translation', async () => {
        vi.mocked(fetch).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ choices: [{ message: { content: '안녕하세요 수정됨' } }] }),
        } as Response);
        const result = await postprocessWithLlm('hello', '안녕 draft');
        expect(result).toBe('안녕하세요 수정됨');
    });

    it('response wrapped in markdown fences → strips fences', async () => {
        vi.mocked(fetch).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ choices: [{ message: { content: '```\n안녕하세요\n```' } }] }),
        } as Response);
        const result = await postprocessWithLlm('hello', '안녕 draft');
        expect(result).toBe('안녕하세요');
    });

    it('mqmErrors populated → includes error feedback in request body', async () => {
        vi.mocked(fetch).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ choices: [{ message: { content: '수정된 번역' } }] }),
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

        const [, options] = vi.mocked(fetch).mock.calls[0];
        const body = JSON.parse((options as RequestInit).body as string) as Record<string, unknown>;
        const messages = body.messages as { role: string; content: string }[];
        const userMessage = messages.find((m) => m.role === 'user');
        expect(userMessage?.content).toContain('Errors to fix:');
        expect(userMessage?.content).toContain('onClick');
    });

    it('empty choices → returns DeepL draft + console.warn', async () => {
        vi.mocked(fetch).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ choices: [] }),
        } as Response);
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const result = await postprocessWithLlm('hello', '안녕 draft');
        expect(result).toBe('안녕 draft');
        expect(warnSpy).toHaveBeenCalledOnce();
    });
});
