import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { callLlm } from '~/translation/client';

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

    it('sends strict json_schema when provided', async () => {
        vi.mocked(fetch).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ choices: [{ message: { content: '{"ok":true}' } }] }),
        } as Response);

        await callLlm([{ role: 'user', content: 'hello' }], {
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

    it('returns LiteLLM usage and response cost metadata', async () => {
        vi.mocked(fetch).mockResolvedValueOnce({
            ok: true,
            headers: new Headers({ 'x-litellm-response-cost': '0.001234' }),
            json: async () => ({
                model: 'claude-sonnet-4-6',
                choices: [{ message: { content: '{"ok":true}' } }],
                usage: {
                    prompt_tokens: 120,
                    completion_tokens: 30,
                    total_tokens: 150,
                },
            }),
        } as Response);

        const result = await callLlm([{ role: 'user', content: 'hello' }], {
            model: 'claude-sonnet-4-6',
            responseFormat: 'json',
        });

        expect(result).toMatchObject({
            content: '{"ok":true}',
            model: 'claude-sonnet-4-6',
            responseCost: 0.001234,
            usage: {
                promptTokens: 120,
                completionTokens: 30,
                totalTokens: 150,
            },
        });
    });
});
