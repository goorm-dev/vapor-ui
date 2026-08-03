import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { callLlm } from '~/client';

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

    it('accepts the model through an options object', async () => {
        vi.mocked(fetch).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ choices: [{ message: { content: '{"ok":true}' } }] }),
        } as Response);

        const result = await callLlm([{ role: 'user', content: 'hello' }], {
            model: 'claude-sonnet-4-6',
        });

        expect(result.content).toBe('{"ok":true}');
        const body = JSON.parse(String(vi.mocked(fetch).mock.calls[0][1]?.body)) as {
            model: string;
        };
        expect(body.model).toBe('claude-sonnet-4-6');
    });

    it('retries 5xx twice with backoff, then gives up', async () => {
        vi.useFakeTimers();
        vi.mocked(fetch).mockResolvedValue({ ok: false, status: 503 } as Response);

        const pending = callLlm([{ role: 'user', content: 'hello' }], { model: 'claude-sonnet-4-6' });
        await vi.runAllTimersAsync();
        const result = await pending;

        expect(vi.mocked(fetch)).toHaveBeenCalledTimes(3);
        expect(result.statusCode).toBe(503);
        vi.useRealTimers();
    });

    it('does not retry 4xx', async () => {
        vi.mocked(fetch).mockResolvedValue({ ok: false, status: 400 } as Response);

        const result = await callLlm([{ role: 'user', content: 'hello' }], { model: 'claude-sonnet-4-6' });

        expect(vi.mocked(fetch)).toHaveBeenCalledOnce();
        expect(result.statusCode).toBe(400);
    });

    it('omits response_format when no schema is given', async () => {
        vi.mocked(fetch).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ choices: [{ message: { content: 'plain text' } }] }),
        } as Response);

        await callLlm([{ role: 'user', content: 'hello' }], { model: 'claude-sonnet-4-6' });

        const body = JSON.parse(String(vi.mocked(fetch).mock.calls[0][1]?.body)) as {
            response_format?: { type: string };
        };
        expect(body.response_format).toBeUndefined();
    });

    it('sends strict json_schema when provided', async () => {
        vi.mocked(fetch).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ choices: [{ message: { content: '{"ok":true}' } }] }),
        } as Response);

        await callLlm([{ role: 'user', content: 'hello' }], {
            model: 'claude-sonnet-4-6',
            jsonSchema: {
                name: 'test_response',
                schema: {
                    type: 'object',
                    additionalProperties: false,
                    required: ['ok'],
                    properties: { ok: { type: 'boolean' } },
                },
            },
        });

        const body = JSON.parse(String(vi.mocked(fetch).mock.calls[0][1]?.body)) as {
            response_format?: {
                type: string;
                json_schema?: { name: string; strict: boolean; schema: object };
            };
        };
        expect(body.response_format).toEqual({
            type: 'json_schema',
            json_schema: {
                name: 'test_response',
                strict: true,
                schema: {
                    type: 'object',
                    additionalProperties: false,
                    required: ['ok'],
                    properties: { ok: { type: 'boolean' } },
                },
            },
        });
    });
});
