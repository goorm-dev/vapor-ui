export interface LlmMessage {
    role: 'system' | 'user';
    content: string;
}

export interface LlmUsage {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
}

export interface LlmCallResult {
    content: string | null;
    error?: string;
    model?: string;
    responseCost?: number;
    statusCode?: number;
    usage?: LlmUsage;
}

export interface LlmCallOptions {
    model?: string;
    responseFormat?: 'text' | 'json';
    jsonSchema?: { name: string; schema: object };
}

function readNumber(value: unknown): number | undefined {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim().length > 0) {
        const parsed = Number(value);
        if (Number.isFinite(parsed)) return parsed;
    }
    return undefined;
}

function readUsage(data: Record<string, unknown>): LlmUsage | undefined {
    const usage = data['usage'];
    if (typeof usage !== 'object' || usage === null) return undefined;

    const record = usage as Record<string, unknown>;
    const result: LlmUsage = {
        promptTokens: readNumber(record['prompt_tokens']),
        completionTokens: readNumber(record['completion_tokens']),
        totalTokens: readNumber(record['total_tokens']),
    };

    return Object.values(result).some((value) => value !== undefined) ? result : undefined;
}

function readResponseCost(response: Response, data: Record<string, unknown>): number | undefined {
    const headers = (response as Response & { headers?: Headers }).headers;
    const headerCost = readNumber(headers?.get('x-litellm-response-cost'));
    if (headerCost !== undefined) return headerCost;

    const bodyCost = readNumber(data['response_cost']);
    if (bodyCost !== undefined) return bodyCost;

    const hiddenParams = data['_hidden_params'];
    if (typeof hiddenParams === 'object' && hiddenParams !== null) {
        return readNumber((hiddenParams as Record<string, unknown>)['response_cost']);
    }

    return undefined;
}

export async function callLlm(
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
                        : options.responseFormat === 'json'
                          ? { response_format: { type: 'json_object' } }
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
        } & Record<string, unknown>;
        const raw = data.choices?.[0]?.message?.content;
        if (typeof raw !== 'string') {
            return { content: null, error: 'Unexpected response shape' };
        }

        return {
            content: raw,
            model:
                typeof data['model'] === 'string'
                    ? data['model']
                    : (options.model ?? 'claude-sonnet-4-6'),
            responseCost: readResponseCost(response, data),
            usage: readUsage(data),
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { content: null, error: `fetch failed: ${message}` };
    }
}
