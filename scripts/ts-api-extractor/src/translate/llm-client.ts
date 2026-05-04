export interface LlmMessage {
    role: 'system' | 'user';
    content: string;
}

export interface LlmCallResult {
    content: string | null;
    error?: string;
}

export async function callLlm(messages: LlmMessage[], model?: string): Promise<LlmCallResult> {
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
        const timeout = setTimeout(() => controller.abort(), 30_000);
        let response: Response;
        try {
            response = await fetch(`${baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model: model ?? 'claude-sonnet-4-6',
                    messages,
                }),
                signal: controller.signal,
            });
        } finally {
            clearTimeout(timeout);
        }

        if (!response.ok) {
            return { content: null, error: `Request failed with status ${response.status}` };
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
