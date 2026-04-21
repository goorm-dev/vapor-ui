export interface LlmMessage {
    role: 'system' | 'user';
    content: string;
}

export interface LlmCallResult {
    content: string | null;
    error?: string;
}

export async function callLlm(messages: LlmMessage[]): Promise<LlmCallResult> {
    const baseUrl = process.env['LITELLM_BASE_URL'];
    if (!baseUrl) {
        return { content: null, error: 'LITELLM_BASE_URL is not set' };
    }

    try {
        const response = await fetch(`${baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env['LITELLM_API_KEY']}`,
            },
            body: JSON.stringify({
                model: process.env['LITELLM_MODEL'] ?? 'claude-sonnet-4-6',
                messages,
            }),
        });

        if (!response.ok) {
            return { content: null, error: `Request failed with status ${response.status}` };
        }

        const data = (await response.json()) as {
            choices?: { message?: { content?: string } }[];
        };
        const content = data.choices?.[0]?.message?.content ?? null;
        if (content === null) {
            return { content: null, error: 'Unexpected response shape' };
        }
        return { content };
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { content: null, error: `fetch failed: ${message}` };
    }
}
