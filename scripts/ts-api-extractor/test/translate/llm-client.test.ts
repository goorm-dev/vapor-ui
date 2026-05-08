import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { callLlm } from '~/translate/llm-client';

describe('callLlm', () => {
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

    it('accepts model and responseFormat through an options object', async () => {
        vi.mocked(fetch).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ choices: [{ message: { content: '{"ok":true}' } }] }),
        } as Response);

        const result = await callLlm([{ role: 'user', content: 'hello' }], {
            model: 'claude-sonnet-4-6',
            responseFormat: 'json',
        });

        expect(result.content).toBe('{"ok":true}');
        const body = JSON.parse(String(vi.mocked(fetch).mock.calls[0][1]?.body)) as {
            model: string;
            response_format?: { type: string };
        };
        expect(body.model).toBe('claude-sonnet-4-6');
        expect(body.response_format).toEqual({ type: 'json_object' });
    });

    it('omits response_format for text calls', async () => {
        vi.mocked(fetch).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ choices: [{ message: { content: 'plain text' } }] }),
        } as Response);

        await callLlm([{ role: 'user', content: 'hello' }], { responseFormat: 'text' });

        const body = JSON.parse(String(vi.mocked(fetch).mock.calls[0][1]?.body)) as {
            response_format?: { type: string };
        };
        expect(body.response_format).toBeUndefined();
    });
});
