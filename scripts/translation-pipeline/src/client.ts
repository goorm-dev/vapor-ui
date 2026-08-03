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
    model: string;
    jsonSchema?: { name: string; schema: object };
}

const RETRY_DELAYS_MS = [1_000, 4_000];

function isRetryable(result: LlmCallResult): boolean {
    if (result.statusCode !== undefined) {
        return result.statusCode === 429 || result.statusCode >= 500;
    }
    return result.error !== undefined && result.error.startsWith('fetch failed');
}

function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function callLlm(
    messages: LlmMessage[],
    options: LlmCallOptions,
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
    options: LlmCallOptions,
): Promise<LlmCallResult> {
    const baseUrl = process.env['LITELLM_BASE_URL'];
    if (!baseUrl) {
        return { content: null, error: 'LITELLM_BASE_URL is not set' };
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
                    'X-Client-Id': 'vapor-ui-translation-pipeline',
                },
                body: JSON.stringify({
                    model: options.model,
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
