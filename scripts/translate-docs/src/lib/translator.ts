import { COMMON_PROPS_KO } from '../constants/index.js';
import type { PropsInfo, TranslationResult } from '../types/index.js';

const DEEPL_API_BASE = process.env.DEEPL_API_KEY?.endsWith(':fx')
    ? 'https://api-free.deepl.com'
    : 'https://api.deepl.com';

/**
 * Translate an array of texts to Korean using the DeepL API.
 * If glossary_id is provided, technical terms are kept in English.
 */
async function translateWithDeepL(
    apiKey: string,
    texts: string[],
    glossaryId?: string,
): Promise<string[]> {
    if (texts.length === 0) return [];

    const body: Record<string, unknown> = {
        text: texts,
        source_lang: 'EN',
        target_lang: 'KO',
    };

    // Add glossary_id when provided
    if (glossaryId) {
        body.glossary_id = glossaryId;
    }

    const response = await fetch(`${DEEPL_API_BASE}/v2/translate`, {
        method: 'POST',
        headers: {
            Authorization: `DeepL-Auth-Key ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`DeepL API error: ${response.status} - ${errorText}`);
    }

    const data = (await response.json()) as {
        translations: Array<{ text: string }>;
    };

    return data.translations.map((t) => t.text);
}

export async function translateBatch(
    apiKey: string,
    propsInfo: PropsInfo,
    glossaryId?: string,
): Promise<TranslationResult> {
    const result: TranslationResult = {
        propDescriptions: {},
    };

    // Collect texts and keys to translate (excluding common props)
    const textsToTranslate: string[] = [];
    const keyMap: string[] = []; // 원래 키 순서 유지

    // Add component description
    if (propsInfo.description) {
        textsToTranslate.push(propsInfo.description);
        keyMap.push('__component__');
    }

    // Handle props: use constants for common props, translate the rest
    for (const prop of propsInfo.props) {
        if (!prop.description) continue;

        if (prop.name in COMMON_PROPS_KO) {
            // Common props are pulled from constants (no API call)
            result.propDescriptions[prop.name] = COMMON_PROPS_KO[prop.name];
        } else {
            textsToTranslate.push(prop.description);
            keyMap.push(prop.name);
        }
    }

    // Return early when there is nothing to translate
    if (textsToTranslate.length === 0) {
        return result;
    }

    // Call DeepL API (batch request, preserve technical terms with glossary)
    const translations = await translateWithDeepL(apiKey, textsToTranslate, glossaryId);

    // Map translated results back to keys
    for (let i = 0; i < keyMap.length; i++) {
        const key = keyMap[i];
        const translated = translations[i];

        if (key === '__component__') {
            result.componentDescription = translated;
        } else {
            result.propDescriptions[key] = translated;
        }
    }

    return result;
}

export function applyTranslation(propsInfo: PropsInfo, translation: TranslationResult): PropsInfo {
    const translated: PropsInfo = { ...propsInfo };

    if (translation.componentDescription) {
        translated.description = translation.componentDescription;
    }

    translated.props = propsInfo.props.map((prop) => ({
        ...prop,
        description: translation.propDescriptions[prop.name] ?? prop.description,
    }));

    return translated;
}
