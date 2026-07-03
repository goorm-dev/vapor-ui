import type { AnthropicMessagesResponse } from './parse';
import type { AnthropicMessagesRequest } from './prompt';

export type EvaluatorEnv = {
    baseUrl: string;
    apiKey: string;
};

export class EvaluatorHttpError extends Error {
    readonly status: number;
    readonly bodyText: string;
    constructor(message: string, status: number, bodyText: string) {
        super(message);
        this.name = 'EvaluatorHttpError';
        this.status = status;
        this.bodyText = bodyText;
    }
}

export class EvaluatorTimeoutError extends Error {
    constructor(message = 'LLM 호출 timeout (60s)') {
        super(message);
        this.name = 'EvaluatorTimeoutError';
    }
}

export type PostOptions = {
    env: EvaluatorEnv;
    signal?: AbortSignal;
    timeoutMs?: number;
    fetchImpl?: typeof fetch;
};

const DEFAULT_TIMEOUT_MS = 60_000;
const RATE_LIMIT_RETRY_DELAY_MS = 2_000;

export async function postLiteLLM(
    request: AnthropicMessagesRequest,
    options: PostOptions,
): Promise<AnthropicMessagesResponse> {
    const { env, signal, timeoutMs = DEFAULT_TIMEOUT_MS, fetchImpl = fetch } = options;

    try {
        return await postOnce(request, env, signal, timeoutMs, fetchImpl);
    } catch (err) {
        if (err instanceof EvaluatorHttpError && err.status === 429) {
            await delay(RATE_LIMIT_RETRY_DELAY_MS, signal);
            return postOnce(request, env, signal, timeoutMs, fetchImpl);
        }
        throw err;
    }
}

async function postOnce(
    request: AnthropicMessagesRequest,
    env: EvaluatorEnv,
    signal: AbortSignal | undefined,
    timeoutMs: number,
    fetchImpl: typeof fetch,
): Promise<AnthropicMessagesResponse> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(new Error('timeout')), timeoutMs);
    const upstreamAbort = () => controller.abort(signal?.reason);
    signal?.addEventListener('abort', upstreamAbort);

    let res: Response;
    try {
        res = await fetchImpl(`${env.baseUrl.replace(/\/$/, '')}/v1/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${env.apiKey}`,
                'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify(request),
            signal: controller.signal,
        });
    } catch (err) {
        if ((err as Error)?.name === 'AbortError' && !signal?.aborted) {
            throw new EvaluatorTimeoutError();
        }
        throw err;
    } finally {
        clearTimeout(timer);
        signal?.removeEventListener('abort', upstreamAbort);
    }

    if (!res.ok) {
        const bodyText = await res.text().catch(() => '');
        throw new EvaluatorHttpError(`LiteLLM ${res.status}`, res.status, bodyText);
    }

    return (await res.json()) as AnthropicMessagesResponse;
}

function delay(ms: number, signal?: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
        if (signal?.aborted) {
            reject(signal.reason ?? new Error('aborted'));
            return;
        }
        const timer = setTimeout(() => resolve(), ms);
        signal?.addEventListener(
            'abort',
            () => {
                clearTimeout(timer);
                reject(signal.reason ?? new Error('aborted'));
            },
            { once: true },
        );
    });
}
