export async function translateWithDeepl(
    texts: string[],
    glossaryId: string,
): Promise<string[] | undefined> {
    const endpoint = process.env['DEEPL_ENDPOINT'];
    const apiKey = process.env['DEEPL_API_KEY'];

    if (!apiKey) {
        console.warn(`[deepl] DEEPL_API_KEY is not set. Falling back (no DeepL).`);
        return undefined;
    }

    const body: Record<string, unknown> = {
        text: texts,
        source_lang: 'EN',
        target_lang: 'KO',
        ...(glossaryId ? { glossary_id: glossaryId } : {}),
    };

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10_000);
        let response: Response;
        try {
            response = await fetch(endpoint ?? 'https://api-free.deepl.com/v2/translate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `DeepL-Auth-Key ${apiKey}`,
                },
                body: JSON.stringify(body),
                signal: controller.signal,
            });
        } finally {
            clearTimeout(timeout);
        }

        if (!response.ok) {
            console.warn(
                `[deepl] Request failed with status ${response.status}. Falling back (no DeepL).`,
            );
            return undefined;
        }

        const data = (await response.json()) as { translations: { text: string }[] };
        return data.translations.map((t) => t.text);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`[deepl] fetch failed: ${message}. Falling back (no DeepL).`);
        return undefined;
    }
}
