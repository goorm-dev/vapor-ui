import type { AnthropicMessagesResponse } from './parse';
import type { AnthropicMessagesRequest } from './prompt';

export type LlmEnv = {
    baseUrl: string;
    apiKey: string;
};

export class LlmHttpError extends Error {
    readonly status: number;
    readonly bodyText: string;
    constructor(message: string, status: number, bodyText: string) {
        super(message);
        this.name = 'LlmHttpError';
        this.status = status;
        this.bodyText = bodyText;
    }
}

export class LlmTimeoutError extends Error {
    constructor(message = 'LLM 호출 timeout') {
        super(message);
        this.name = 'LlmTimeoutError';
    }
}

export type LlmProgress = {
    phase: 'thinking' | 'finalizing';
    estimatedDurationMs?: number;
};

export type PostOptions = {
    env: LlmEnv;
    signal?: AbortSignal;
    timeoutMs?: number;
    fetchImpl?: typeof fetch;
    tags?: string[];
    onProgress?: (progress: LlmProgress) => void;
};

const DEFAULT_TIMEOUT_MS = 300_000;
const RATE_LIMIT_RETRY_DELAY_MS = 2_000;

export async function postLiteLLM(
    request: AnthropicMessagesRequest,
    options: PostOptions,
): Promise<AnthropicMessagesResponse> {
    const {
        env,
        signal,
        timeoutMs = DEFAULT_TIMEOUT_MS,
        fetchImpl = fetch,
        tags,
        onProgress,
    } = options;

    try {
        return await postOnce(request, env, signal, timeoutMs, fetchImpl, tags, onProgress);
    } catch (err) {
        if (err instanceof LlmHttpError && err.status === 429) {
            await delay(RATE_LIMIT_RETRY_DELAY_MS, signal);
            return postOnce(request, env, signal, timeoutMs, fetchImpl, tags, onProgress);
        }
        throw err;
    }
}

async function postOnce(
    request: AnthropicMessagesRequest,
    env: LlmEnv,
    signal: AbortSignal | undefined,
    timeoutMs: number,
    fetchImpl: typeof fetch,
    tags: string[] | undefined,
    onProgress: ((p: LlmProgress) => void) | undefined,
): Promise<AnthropicMessagesResponse> {
    const controller = new AbortController();

    let timedOut = false;
    const timer = setTimeout(() => {
        timedOut = true;
        controller.abort();
    }, timeoutMs);

    const upstreamAbort = () => controller.abort(signal?.reason);
    signal?.addEventListener('abort', upstreamAbort);

    const cleanup = () => {
        clearTimeout(timer);
        signal?.removeEventListener('abort', upstreamAbort);
    };

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.apiKey}`,
        'anthropic-version': '2023-06-01',
    };

    if (tags && tags.length > 0) {
        headers['x-litellm-tags'] = tags.join(',');
    }

    onProgress?.({ phase: 'thinking' });

    let res: Response;

    try {
        res = await fetchImpl(`${env.baseUrl.replace(/\/$/, '')}/v1/messages`, {
            method: 'POST',
            headers,
            body: JSON.stringify(request),
            signal: controller.signal,
        });
    } catch (err) {
        cleanup();
        if (timedOut) throw new LlmTimeoutError();
        throw err;
    }

    if (!res.ok) {
        const bodyText = await res.text().catch(() => '');
        cleanup();
        throw new LlmHttpError(`LiteLLM ${res.status}`, res.status, bodyText);
    }

    try {
        const json = (await res.json()) as AnthropicMessagesResponse;
        onProgress?.({ phase: 'finalizing' });
        return json;
    } catch (err) {
        if (timedOut) throw new LlmTimeoutError();
        throw err;
    } finally {
        cleanup();
    }
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
