export interface LlmMessage {
    role: 'system' | 'user';
    content: string;
}

export interface LlmCallResult {
    content: string | null;
    error?: string;
    statusCode?: number;
}

export interface LlmCallOptions {
    model?: string;
    jsonSchema?: { name: string; schema: object };
}

/** 재시도 지연(ms). 429/5xx/타임아웃만 재시도한다 — 4xx는 재시도해도 같은 답이다 (KAN-11). */
const RETRY_DELAYS_MS = [1_000, 4_000];

function isRetryable(result: LlmCallResult): boolean {
    if (result.statusCode !== undefined) {
        return result.statusCode === 429 || result.statusCode >= 500;
    }
    // statusCode가 없는 실패는 네트워크 오류·타임아웃(AbortError)
    return result.error !== undefined && result.error.startsWith('fetch failed');
}

function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function callLlm(
    messages: LlmMessage[],
    options: LlmCallOptions = {},
): Promise<LlmCallResult> {
    let result = await callLlmOnce(messages, options);
    for (const wait of RETRY_DELAYS_MS) {
        if (result.content !== null || !isRetryable(result)) return result;
        await delay(wait);
        result = await callLlmOnce(messages, options);
    }
    return result;
}

async function callLlmOnce(
    messages: LlmMessage[],
    options: LlmCallOptions = {},
): Promise<LlmCallResult> {
    const baseUrl = process.env['LITELLM_BASE_URL'];
    const apiKey = process.env['LITELLM_API_KEY'];
    if (!baseUrl) {
        return { content: null, error: 'LITELLM_BASE_URL is not set' };
    }
    if (!apiKey) {
        return { content: null, error: 'LITELLM_API_KEY is not set' };
    }

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 60_000);
        let response: Response;
        try {
            response = await fetch(`${baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${apiKey}`,
                    // 게이트웨이 사용량 집계용 라벨. 요구하지 않는 프록시는 무시한다.
                    'X-Client-Id': 'vapor-ui-translation-pipeline',
                },
                body: JSON.stringify({
                    model: options.model ?? 'claude-sonnet-4-6',
                    messages,
                    ...(options.jsonSchema
                        ? {
                              response_format: {
                                  type: 'json_schema',
                                  json_schema: {
                                      name: options.jsonSchema.name,
                                      strict: true,
                                      schema: options.jsonSchema.schema,
                                  },
                              },
                          }
                        : {}),
                }),
                signal: controller.signal,
            });
        } finally {
            clearTimeout(timeout);
        }

        if (!response.ok) {
            return {
                content: null,
                error: `Request failed with status ${response.status}`,
                statusCode: response.status,
            };
        }

        const data = (await response.json()) as {
            choices?: { message?: { content?: unknown } }[];
        };
        const raw = data.choices?.[0]?.message?.content;
        if (typeof raw !== 'string') {
            return { content: null, error: 'Unexpected response shape' };
        }

        return { content: raw };
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { content: null, error: `fetch failed: ${message}` };
    }
}
