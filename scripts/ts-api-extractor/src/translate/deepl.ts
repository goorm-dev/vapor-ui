export async function translateWithDeepl(
    texts: string[],
    glossaryId: string,
): Promise<string[]> {
    const endpoint = process.env['DEEPL_ENDPOINT'];
    const apiKey = process.env['DEEPL_API_KEY'];

    if (!apiKey) {
        console.warn(`[deepl] DEEPL_API_KEY is not set. Returning original texts.`);
        return texts;
    }

    const body: Record<string, unknown> = {
        text: texts,
        source_lang: 'EN',
        target_lang: 'KO',
        ...(glossaryId ? { glossary_id: glossaryId } : {}),
    };

    try {
        const response = await fetch(endpoint ?? 'https://api-free.deepl.com/v2/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `DeepL-Auth-Key ${apiKey}`,
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            console.warn(
                `[deepl] Request failed with status ${response.status}. Returning original texts.`,
            );
            return texts;
        }

        const data = (await response.json()) as { translations: { text: string }[] };
        return data.translations.map((t) => t.text);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`[deepl] fetch failed: ${message}. Returning original texts.`);
        return texts;
    }
}
