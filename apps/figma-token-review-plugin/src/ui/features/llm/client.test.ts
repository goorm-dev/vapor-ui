import { describe, expect, it, vi } from 'vitest';

import type { LlmProgress } from './client';
import { LlmHttpError, postLiteLLM } from './client';
import type { AnthropicMessagesRequest } from './prompt';

const REQUEST: AnthropicMessagesRequest = {
    model: 'test-model',
    max_tokens: 1000,
    system: [{ type: 'text', text: 'sys' }],
    messages: [{ role: 'user', content: [{ type: 'text', text: 'hi' }] }],
};

describe('postLiteLLM', () => {
    it('JSON 응답을 AnthropicMessagesResponse 로 반환', async () => {
        const body = { content: [{ type: 'text', text: '{"a":1}' }] };
        const fetchImpl = vi.fn(
            async () =>
                new Response(JSON.stringify(body), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                }),
        );
        const progress: LlmProgress[] = [];

        const res = await postLiteLLM(REQUEST, {
            env: { baseUrl: 'https://example.test', apiKey: 'k' },
            fetchImpl: fetchImpl as unknown as typeof fetch,
            onProgress: (p) => progress.push(p),
        });

        expect(res.content).toEqual([{ type: 'text', text: '{"a":1}' }]);
        expect(progress).toEqual([{ phase: 'thinking' }, { phase: 'finalizing' }]);
    });

    it('non-2xx 응답은 LlmHttpError', async () => {
        const fetchImpl = vi.fn(async () => new Response('bad key', { status: 401 }));

        await expect(
            postLiteLLM(REQUEST, {
                env: { baseUrl: 'https://example.test', apiKey: 'k' },
                fetchImpl: fetchImpl as unknown as typeof fetch,
            }),
        ).rejects.toBeInstanceOf(LlmHttpError);
    });

    it('요청 body에 stream 옵션 없음', async () => {
        let capturedBody = '';
        const fetchImpl = vi.fn(async (_url: string, init: RequestInit) => {
            capturedBody = String(init.body);
            return new Response(JSON.stringify({ content: [] }), { status: 200 });
        });

        await postLiteLLM(REQUEST, {
            env: { baseUrl: 'https://example.test', apiKey: 'k' },
            fetchImpl: fetchImpl as unknown as typeof fetch,
        });

        const parsed = JSON.parse(capturedBody);
        expect(parsed.stream).toBeUndefined();
    });
});
